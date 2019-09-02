use mongodb::ordered::OrderedDocument;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Session {
    id_token: String,
    expires_at: i64,
}

impl Session {
    pub fn new(id_token: String, expires_at: i64) -> Self {
        Session {
            id_token,
            expires_at,
        }
    }
}

impl From<OrderedDocument> for Session {
    fn from(document: OrderedDocument) -> Self {
        Session {
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
