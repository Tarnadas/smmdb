use super::Database;

use bson::ordered::OrderedDocument;
use mongodb::coll::Collection;
use rand::{distributions::Alphanumeric, thread_rng, Rng};

pub struct Migration;

impl Migration {
    pub fn run(database: &Database) {
        Migration::generate_api_keys(&database.accounts);
    }

    fn generate_api_keys(coll: &Collection) {
        let accounts: Vec<OrderedDocument> = coll
            .find(None, None)
            .unwrap()
            .map(|item| item.unwrap())
            .collect();
        for account in accounts {
            let apikey = account.get_str("apikey");
            if apikey.is_err() || apikey == Ok("") {
                let apikey: String = thread_rng().sample_iter(&Alphanumeric).take(30).collect();
                let filter = doc! {
                    "_id" => account.get_object_id("_id").unwrap().to_owned()
                };
                let update = doc! {
                    "$set" => {
                        "apikey" => apikey
                    }
                };
                coll.update_one(filter, update, None).unwrap();
            }
        }
    }
}
