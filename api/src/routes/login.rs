use crate::account::{AccountConvertError, AccountReq, AccountRes};
use crate::server::ServerData;
use crate::session::Session;

use futures::future::Future;
use reqwest::r#async::Client;
use serde::Deserialize;
use std::convert::TryInto;

use actix_web::{
    dev::{self, HttpResponseBuilder},
    error::ResponseError,
    http::StatusCode,
    post, web, HttpRequest, HttpResponse,
};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Login {
    token_obj: TokenObj,
}

#[derive(Debug, Deserialize)]
struct TokenObj {
    id_token: String,
    expires_at: i64,
}

#[derive(Debug, Deserialize)]
pub struct IdInfo {
    pub iss: String,
    pub sub: String,
    pub azp: String,
    pub aud: String,
    pub iat: String,
    pub exp: String,
    pub hd: Option<String>,
    pub email: Option<String>,
    pub email_verified: Option<String>,
    pub name: Option<String>,
    pub picture: Option<String>,
    pub given_name: Option<String>,
    pub family_name: Option<String>,
    pub locale: Option<String>,
}

pub fn service() -> impl dev::HttpServiceFactory {
    web::scope("/login").service(login)
}

#[post("/google")]
fn login(
    data: web::Data<ServerData>,
    req: HttpRequest,
    json: web::Json<Login>,
) -> impl Future<Item = HttpResponse, Error = LoginError> {
    let id_token = json.token_obj.id_token.clone();
    Client::new()
        .get(&format!(
            "https://oauth2.googleapis.com/tokeninfo?id_token={}",
            id_token
        ))
        .send()
        .and_then(|mut res| res.json())
        .map_err(|res| res.into())
        .and_then(move |id_info: IdInfo| {
            let data = data.lock().unwrap();
            if data.google_client_id != id_info.aud {
                Err(LoginError::ClientIdInvalid(id_info.aud))
            } else {
                let account: AccountReq = id_info.try_into()?;
                let account = data.add_or_get_account(
                    account,
                    Session::new(id_token.clone(), json.token_obj.expires_at),
                )?;
                // TODO get stars from database
                let account = AccountRes::new(account);
                Ok(HttpResponseBuilder::new(StatusCode::OK).json(account))
            }
        })
}

#[derive(Fail, Debug)]
enum LoginError {
    #[fail(display = "Client Id invalid: {}", _0)]
    ClientIdInvalid(String),
    #[fail(display = "Request error: {}", _0)]
    Request(reqwest::Error),
    #[fail(display = "{}", _0)]
    AccountConvert(AccountConvertError),
    #[fail(display = "Mongodb error: {}", _0)]
    MongodbError(mongodb::Error),
}

impl From<reqwest::Error> for LoginError {
    fn from(err: reqwest::Error) -> Self {
        LoginError::Request(err)
    }
}

impl From<AccountConvertError> for LoginError {
    fn from(err: AccountConvertError) -> Self {
        LoginError::AccountConvert(err)
    }
}

impl From<mongodb::Error> for LoginError {
    fn from(err: mongodb::Error) -> Self {
        LoginError::MongodbError(err)
    }
}

impl ResponseError for LoginError {
    fn error_response(&self) -> HttpResponse {
        match *self {
            LoginError::ClientIdInvalid(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            LoginError::Request(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            LoginError::AccountConvert(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            LoginError::MongodbError(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
        }
    }
}
