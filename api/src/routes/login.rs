use crate::{
    account::{AccountConvertError, AccountReq, AccountRes},
    server::ServerData,
    session::AuthSession,
    Identity,
};

use actix_session::Session;
use actix_web::{
    client::Client,
    dev::{self, HttpResponseBuilder},
    error::ResponseError,
    http::StatusCode,
    post, web, HttpRequest, HttpResponse,
};
use awc::{error::JsonPayloadError, SendClientRequest};
use serde::Deserialize;
use std::convert::TryInto;

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
    web::scope("/login")
        .service(login)
        .service(login_with_google)
}

#[post("")]
fn login(_data: web::Data<ServerData>, _req: HttpRequest, identity: Identity) -> HttpResponse {
    let account = identity.get_account();
    let account = AccountRes::new(&account);
    HttpResponseBuilder::new(StatusCode::OK).json(account)
}

#[post("/google")]
async fn login_with_google(
    data: web::Data<ServerData>,
    _req: HttpRequest,
    json: web::Json<Login>,
    client: web::Data<Client>,
    session: Session,
) -> Result<HttpResponse, LoginError> {
    let id_token = json.token_obj.id_token.clone();
    let request: SendClientRequest = client
        .get(&format!(
            "https://oauth2.googleapis.com/tokeninfo?id_token={}",
            id_token
        ))
        .send();
    let mut response = request.await.map_err(|_| LoginError::Request)?;

    let id_info: IdInfo = response.json().await?;
    if data.google_client_id != id_info.aud {
        Err(LoginError::ClientIdInvalid(id_info.aud).into())
    } else {
        let account: AccountReq = id_info.try_into()?;
        session.set("id_token", id_token.clone()).unwrap();
        session
            .set("expires_at", json.token_obj.expires_at)
            .unwrap();
        let account = data.add_or_get_account(
            account,
            AuthSession::new(id_token.clone(), json.token_obj.expires_at),
        )?;
        // TODO get stars from database
        let account = AccountRes::new(&account);
        session.set("account_id", account.get_id()).unwrap();
        Ok(HttpResponseBuilder::new(StatusCode::OK).json(account))
    }
}

#[derive(Fail, Debug)]
enum LoginError {
    #[fail(display = "Client Id invalid: {}", _0)]
    ClientIdInvalid(String),
    #[fail(display = "Google OAuth unavailable")]
    Request,
    #[fail(display = "{}", _0)]
    JsonPayload(JsonPayloadError),
    #[fail(display = "{}", _0)]
    SerdeJson(serde_json::Error),
    #[fail(display = "{}", _0)]
    AccountConvert(AccountConvertError),
    #[fail(display = "Mongodb error: {}", _0)]
    MongodbError(mongodb::error::Error),
}

impl From<JsonPayloadError> for LoginError {
    fn from(err: JsonPayloadError) -> Self {
        LoginError::JsonPayload(err)
    }
}

impl From<serde_json::Error> for LoginError {
    fn from(err: serde_json::Error) -> Self {
        LoginError::SerdeJson(err)
    }
}

impl From<AccountConvertError> for LoginError {
    fn from(err: AccountConvertError) -> Self {
        LoginError::AccountConvert(err)
    }
}

impl From<mongodb::error::Error> for LoginError {
    fn from(err: mongodb::error::Error) -> Self {
        LoginError::MongodbError(err)
    }
}

impl ResponseError for LoginError {
    fn error_response(&self) -> HttpResponse {
        match *self {
            LoginError::ClientIdInvalid(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            LoginError::Request => HttpResponse::new(StatusCode::INTERNAL_SERVER_ERROR),
            LoginError::JsonPayload(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            LoginError::SerdeJson(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            LoginError::AccountConvert(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            LoginError::MongodbError(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
        }
    }
}
