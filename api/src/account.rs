use crate::session::Session;

use google_signin::IdInfo;
use mongodb::oid::ObjectId;
use mongodb::ordered::OrderedDocument;
use serde::Serialize;
use std::convert::TryFrom;

#[derive(Debug, Serialize)]
pub struct Account {
    #[serde(rename = "_id")]
    id: ObjectId,
    googleid: String,
    username: String,
    email: String,
    apikey: String,
    downloadformat: Option<DownloadFormat>,
    session: Option<Session>,
}

#[derive(Clone, Debug, Serialize)]
pub struct AccountRes {
    googleid: String,
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
            googleid: document
                .get_str("googleid")
                .expect("[Account::from] googleid unwrap failed")
                .to_string(),
            username: document
                .get_str("username")
                .expect("[Account::from] username unwrap failed")
                .to_string(),
            email: document
                .get_str("email")
                .expect("[Account::from] email unwrap failed")
                .to_string(),
            apikey: document
                .get_str("apikey")
                .expect("[Account::from] apikey unwrap failed")
                .to_string(),
            downloadformat: document
                .get_i32("downloadformat")
                .ok()
                .map(|format| format.into()),
            session: document
                .get_document("session")
                .ok()
                .map(|session| session.clone().into()),
        }
    }
}

impl TryFrom<IdInfo> for AccountRes {
    type Error = AccountConvertError;

    fn try_from(id_info: IdInfo) -> Result<Self, Self::Error> {
        let email = id_info.email.ok_or(AccountConvertError::EmailMissing)?;
        let email_verified = id_info
            .email_verified
            .ok_or(AccountConvertError::EmailNotVerified)?;
        if email_verified != "true" {
            return Err(AccountConvertError::EmailNotVerified);
        }
        let username = email
            .split('@')
            .next()
            .ok_or(AccountConvertError::EmailParsingFailed)?;
        Ok(AccountRes {
            googleid: id_info.sub,
            username: username.to_owned(),
            email,
        })
    }
}

impl Account {
    pub fn new(account: AccountRes, id: ObjectId, session: Session) -> Self {
        Account {
            id,
            googleid: account.googleid,
            username: account.username,
            email: account.email,
            apikey: "".to_string(),
            downloadformat: None,
            session: Some(session),
        }
    }

    pub fn get_id(self) -> ObjectId {
        self.id
    }

    pub fn get_id_ref(&self) -> &ObjectId {
        &self.id
    }

    pub fn get_username(&self) -> &String {
        &self.username
    }
}

impl AccountRes {
    pub fn into_ordered_document(self) -> OrderedDocument {
        doc! {
            "googleid" => self.googleid,
            "username" => self.username,
            "email" => self.email,
        }
    }

    pub fn as_find(&self) -> OrderedDocument {
        doc! {
            "googleid" => self.googleid.clone()
        }
    }
}

#[derive(Fail, Debug)]
pub enum AccountConvertError {
    #[fail(display = "email missing in OAuth2 response")]
    EmailMissing,
    #[fail(display = "email not verified")]
    EmailNotVerified,
    #[fail(display = "parsing username from email failed")]
    EmailParsingFailed,
}

#[derive(Debug, Serialize)]
enum DownloadFormat {
    WiiU = 0,
    N3DS = 1,
    Protobuf = 2,
}

impl From<i32> for DownloadFormat {
    fn from(i: i32) -> Self {
        match i {
            0 => DownloadFormat::WiiU,
            1 => DownloadFormat::N3DS,
            2 => DownloadFormat::Protobuf,
            _ => panic!(),
        }
    }
}
