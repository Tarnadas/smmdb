use mongodb::oid::ObjectId;
use mongodb::ordered::OrderedDocument;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Account {
    #[serde(rename = "_id")]
    id: ObjectId,
    username: String,
    email: String,
}

impl From<OrderedDocument> for Account {
    fn from(document: OrderedDocument) -> Account {
        Account {
            id: document
                .get_object_id("_id")
                .expect("[Account::from] id unwrap failed")
                .to_owned(),
            username: document
                .get_str("username")
                .expect("[Account::from] username unwrap failed")
                .to_string(),
            email: document
                .get_str("email")
                .expect("[Account::from] email unwrap failed")
                .to_string(),
        }
    }
}

impl Account {
    pub fn get_id(&self) -> &ObjectId {
        &self.id
    }

    pub fn get_username(&self) -> &String {
        &self.username
    }
}
