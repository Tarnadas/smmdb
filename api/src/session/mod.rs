mod identity;

pub use identity::*;

use crate::server::ServerData;

use actix_service::{Service, Transform};
use actix_session::{Session, UserSession};
use actix_web::{
    dev::{RequestHead, ServiceRequest, ServiceResponse},
    http::header,
    web::Data,
    Error,
};
use bson::{oid::ObjectId, ordered::OrderedDocument};
use futures::future::{ok, Future, Ready};
use serde::Serialize;
use std::{
    convert::TryFrom,
    pin::Pin,
    task::{Context, Poll},
};

#[derive(Clone, Debug, Serialize)]
pub struct AuthSession {
    id_token: String,
    pub expires_at: i64,
}

impl AuthSession {
    pub fn new(id_token: String, expires_at: i64) -> Self {
        AuthSession {
            id_token,
            expires_at,
        }
    }
}

impl From<OrderedDocument> for AuthSession {
    fn from(document: OrderedDocument) -> Self {
        AuthSession {
            id_token: document
                .get_str("id_token")
                .expect("[Session::from] id_token unwrap failed")
                .to_string(),
            expires_at: document
                .get_i64("expires_at")
                .expect("[Session::from] expires_at unwrap failed"),
        }
    }
}

impl Into<OrderedDocument> for AuthSession {
    fn into(self) -> OrderedDocument {
        doc! {
            "id_token" => self.id_token,
            "expires_at" => self.expires_at,
        }
    }
}

pub struct Auth;

impl<S, B> Transform<S> for Auth
where
    S: Service<Request = ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Request = ServiceRequest;
    type Response = ServiceResponse<B>;
    type Error = Error;
    type InitError = ();
    type Transform = AuthMiddleware<S>;
    type Future = Ready<Result<Self::Transform, Self::InitError>>;

    fn new_transform(&self, service: S) -> Self::Future {
        ok(AuthMiddleware { service })
    }
}

pub struct AuthMiddleware<S> {
    service: S,
}

impl<S, B> Service for AuthMiddleware<S>
where
    S: Service<Request = ServiceRequest, Response = ServiceResponse<B>, Error = Error>,
    S::Future: 'static,
    B: 'static,
{
    type Request = ServiceRequest;
    type Response = ServiceResponse<B>;
    type Error = Error;
    type Future = Pin<Box<dyn Future<Output = Result<Self::Response, Self::Error>>>>;

    fn poll_ready(&mut self, cx: &mut Context<'_>) -> Poll<Result<(), Self::Error>> {
        self.service.poll_ready(cx)
    }

    fn call(&mut self, mut req: ServiceRequest) -> Self::Future {
        let session = req.get_session();
        let data: Option<Data<ServerData>> = req.app_data();
        if let Some(data) = data {
            if let Ok(auth_req) = AuthReq::try_from(session) {
                let expires_at = auth_req.session.as_ref().unwrap().expires_at;
                if let Some(account) = data.get_account_from_auth(auth_req) {
                    if !account.is_expired(expires_at) {
                        Identity::set_identity(account, &mut req);
                    }
                }
            } else if let Ok(auth_req) = AuthReq::try_from(req.head()) {
                if let Some(account) = data.get_account_from_auth(auth_req) {
                    Identity::set_identity(account, &mut req);
                }
            }
        }

        let fut = self.service.call(req);
        Box::pin(async move {
            let res = fut.await?;
            Ok(res)
        })
    }
}

#[derive(Debug)]
pub struct AuthReq {
    account_id: ObjectId,
    apikey: Option<String>,
    session: Option<AuthSession>,
}

impl TryFrom<Session> for AuthReq {
    type Error = ();

    fn try_from(session: Session) -> Result<Self, Self::Error> {
        if let (Ok(Some(account_id)), Ok(Some(id_token)), Ok(Some(expires_at))) = (
            session.get::<String>("account_id"),
            session.get::<String>("id_token"),
            session.get::<i64>("expires_at"),
        ) {
            if let Ok(account_id) = ObjectId::with_string(&account_id) {
                return Ok(AuthReq {
                    account_id,
                    apikey: None,
                    session: Some(AuthSession {
                        id_token,
                        expires_at,
                    }),
                });
            }
        }
        Err(())
    }
}

impl TryFrom<&RequestHead> for AuthReq {
    type Error = ();

    fn try_from(header: &RequestHead) -> Result<Self, Self::Error> {
        if let Some(authorization) = header.headers().get(header::AUTHORIZATION) {
            if let Ok(authorization) = authorization.to_str() {
                let s: Vec<&str> = authorization.split(' ').collect();
                if let (Some("APIKEY"), Some(account_id), Some(apikey)) =
                    (s.get(0).copied(), s.get(1), s.get(2))
                {
                    if let Ok(account_id) = ObjectId::with_string(&account_id) {
                        return Ok(AuthReq {
                            account_id,
                            apikey: Some((*apikey).to_string()),
                            session: None,
                        });
                    }
                }
            }
        }
        Err(())
    }
}

impl Into<OrderedDocument> for AuthReq {
    fn into(self) -> OrderedDocument {
        let mut doc = doc! {
            "_id" => self.account_id,
        };
        if let Some(session) = self.session {
            let session: OrderedDocument = session.into();
            doc.insert("session", session);
        }
        if let Some(apikey) = self.apikey {
            doc.insert("apikey", apikey);
        }
        doc
    }
}
