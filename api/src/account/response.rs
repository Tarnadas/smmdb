use super::Account;

use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct AccountRes {
    id: String,
    username: String,
    downloadformat: i32,
    apikey: String,
    stars: Vec<String>,
    stars64: Vec<String>,
    permissions: i32,
}

impl AccountRes {
    pub fn new(account: &Account) -> Self {
        AccountRes {
            id: account.id.to_hex(),
            username: account.username.clone(),
            downloadformat: account.downloadformat.clone().unwrap_or_default().into(),
            apikey: account.apikey.clone(),
            stars: vec![],
            stars64: vec![],
            permissions: account.permissions.unwrap_or_default(),
        }
    }

    pub fn get_id(&self) -> &String {
        &self.id
    }
}
