mod identity;

pub use identity::*;

use crate::server::ServerData;

use actix_service::{Service, Transform};
use actix_session::{Session, UserSession};
use actix_web::{
    dev::{ServiceRequest, ServiceResponse},
    web::Data,
    Error,
};
use futures::future::{ok, FutureResult};
use futures::{Future, Poll};
use mongodb::{oid::ObjectId, ordered::OrderedDocument};
use serde::Serialize;
use std::convert::TryFrom;

#[derive(Debug, Serialize)]
pub struct AuthSession {
    id_token: String,
    expires_at: i64,
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
    type Future = FutureResult<Self::Transform, Self::InitError>;

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
    type Future = Box<dyn Future<Item = Self::Response, Error = Self::Error>>;

    fn poll_ready(&mut self) -> Poll<(), Self::Error> {
        self.service.poll_ready()
    }

    fn call(&mut self, mut req: ServiceRequest) -> Self::Future {
        let session = req.get_session();
        let data: Option<Data<ServerData>> = req.app_data();
        if let (Some(data), Ok(auth_req)) = (data, AuthReq::try_from(session)) {
            let data = data.lock().unwrap();
            if let Some(account) = data.get_account_from_auth(auth_req) {
                Identity::set_identity(account, &mut req);
            }
        }

        Box::new(self.service.call(req).and_then(|res| Ok(res)))
    }
}

#[derive(Debug)]
pub struct AuthReq {
    account_id: String,
    session: AuthSession,
}

impl TryFrom<Session> for AuthReq {
    type Error = ();

    fn try_from(session: Session) -> Result<Self, Self::Error> {
        if let (Ok(Some(account_id)), Ok(Some(id_token)), Ok(Some(expires_at))) = (
            session.get::<String>("account_id"),
            session.get::<String>("id_token"),
            session.get::<i64>("expires_at"),
        ) {
            Ok(AuthReq {
                account_id,
                session: AuthSession {
                    id_token,
                    expires_at,
                },
            })
        } else {
            Err(())
        }
    }
}

impl Into<OrderedDocument> for AuthReq {
    fn into(self) -> OrderedDocument {
        let session: OrderedDocument = self.session.into();
        doc! {
            "_id" => ObjectId::with_string(&self.account_id).unwrap(),
            "session" => session,
        }
    }
}
