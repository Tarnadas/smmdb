use crate::account::{AccountConvertError, AccountRes};
use crate::server::ServerData;
use crate::session::Session;

use google_signin;
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

pub fn service() -> impl dev::HttpServiceFactory {
    web::scope("/login").service(login)
}

#[post("/google")]
fn login(
    data: web::Data<ServerData>,
    req: HttpRequest,
    json: web::Json<Login>,
) -> Result<HttpResponse, LoginError> {
    let mut client = google_signin::Client::new();
    client.audiences.push("".to_string());
    let id_token = &json.token_obj.id_token;
    let id_info = client.verify(id_token)?;
    let account: AccountRes = id_info.try_into()?;
    let account = data.lock().unwrap().add_or_get_account(
        account,
        Session::new(id_token.clone(), json.token_obj.expires_at),
    )?;
    Ok(HttpResponseBuilder::new(StatusCode::OK).json(account))
}

#[derive(Fail, Debug)]
enum LoginError {
    #[fail(display = "OAuth2 verification failed: {}", _0)]
    OAuth2VerificationFailed(google_signin::Error),
    #[fail(display = "{}", _0)]
    AccountConvertError(AccountConvertError),
    #[fail(display = "Mongodb error: {}", _0)]
    MongodbError(mongodb::Error),
}

impl From<google_signin::Error> for LoginError {
    fn from(err: google_signin::Error) -> Self {
        LoginError::OAuth2VerificationFailed(err)
    }
}

impl From<AccountConvertError> for LoginError {
    fn from(err: AccountConvertError) -> Self {
        LoginError::AccountConvertError(err)
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
            LoginError::OAuth2VerificationFailed(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            LoginError::AccountConvertError(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            LoginError::MongodbError(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
        }
    }
}
