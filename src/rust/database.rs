use crate::account::Account;
use crate::course::{Course, CourseResponse};

use mongodb::db::ThreadedDatabase;

use mongodb::oid::ObjectId;
use mongodb::{Client, ThreadedClient};
#[derive(Clone)]
pub struct Database {
    client: Client,
}

impl Database {
    pub fn new() -> Self {
        let client = Client::with_uri("mongodb://localhost:27017")
            .expect("Failed to initialize standalone client.");

        Database { client }
    }

    pub fn get_courses(&self) -> String {
        let courses = self.client.db("admin").collection("courses");
        match courses.aggregate(
            vec![doc! {
                "$limit" => 10
            }],
            None,
        ) {
            Ok(cursor) => {
                let course: Vec<CourseResponse> = cursor
                    .map(|item| {
                        let course: Course = item.unwrap().into();
                        let account = self
                            .get_account(course.get_owner().clone())
                            .expect("[Database::get_course] account not found");
                        CourseResponse::from_course(course, account)
                    })
                    .collect();
                serde_json::to_string(&course).unwrap()
            }
            Err(e) => e.to_string(),
        }
    }

    pub fn get_account(&self, account_id: ObjectId) -> Option<Account> {
        let accounts = self.client.db("admin").collection("accounts");
        let mut account_res: Vec<Account> = accounts
            .find(
                Some(doc! {
                    "_id" => account_id
                }),
                None,
            )
            .unwrap()
            .map(|item| item.unwrap().into())
            .collect();
        account_res.pop()
    }

    pub fn get_accounts(&self) -> Vec<Account> {
        let accounts = self.client.db("admin").collection("accounts");
        accounts
            .find(None, None)
            .unwrap()
            .map(|item| item.unwrap().into())
            .collect()
    }
}
