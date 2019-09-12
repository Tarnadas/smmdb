use mongodb::ordered::OrderedDocument;
use serde::Serialize;

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
