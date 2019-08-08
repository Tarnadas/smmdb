use crate::account::Account;
use crate::collections::Collections;
use crate::course::{Course, CourseResponse};
use crate::course2::{Course2, Course2Response};

use mongodb::db::ThreadedDatabase;
use mongodb::oid::ObjectId;
use mongodb::ordered::OrderedDocument;
use mongodb::{coll::Collection, Client, ThreadedClient};
use std::env;

pub struct Database {
    client: Client,
    courses: Collection,
    courses2: Collection,
    accounts: Collection,
}

impl Database {
    pub fn new() -> Self {
        let host = match env::var("DOCKER") {
            Ok(val) => match val.as_ref() {
                "true" | "1" => "mongodb",
                _ => "localhost",
            },
            Err(_) => "localhost",
        };
        let client = Client::with_uri(&format!("mongodb://{}:27017", host))
            .expect("Failed to initialize standalone client.");
        let courses = client.db("admin").collection(Collections::Courses.as_str());
        let courses2 = client.db("admin").collection(Collections::Courses2.as_str());
        let accounts = client
            .db("admin")
            .collection(Collections::Accounts.as_str());

        Database {
            client,
            courses,
            courses2,
            accounts,
        }
    }

    pub fn get_courses(&self, query: Vec<OrderedDocument>) -> String {
        match self.courses.aggregate(query, None) {
            Ok(cursor) => {
                let (account_ids, courses): (Vec<bson::Bson>, Vec<Course>) = cursor
                    .map(|item| {
                        let course: Course = item.unwrap().into();
                        (course.get_owner().clone().into(), course)
                    })
                    .unzip();

                let accounts = self.get_accounts(account_ids);
                let courses: Vec<CourseResponse> = courses
                    .into_iter()
                    .map(|course| {
                        let account = accounts
                            .iter()
                            .find(|account| {
                                account.get_id_ref().to_string() == course.get_owner().to_string()
                            })
                            .unwrap();
                        CourseResponse::from_course(course, account)
                    })
                    .collect();

                serde_json::to_string(&courses).unwrap()
            }
            Err(e) => e.to_string(),
        }
    }

    pub fn get_courses2(&self, query: Vec<OrderedDocument>) -> String {
        match self.courses2.aggregate(query, None) {
            Ok(cursor) => {
                let (account_ids, courses): (Vec<bson::Bson>, Vec<Course2>) = cursor
                    .map(|item| {
                        let course: Course2 = item.unwrap().into();
                        (course.get_owner().clone().into(), course)
                    })
                    .unzip();

                let accounts = self.get_accounts(account_ids);
                let courses: Vec<Course2Response> = courses
                    .into_iter()
                    .map(|course| {
                        let account = accounts
                            .iter()
                            .find(|account| {
                                account.get_id_ref().to_string() == course.get_owner().to_string()
                            })
                            .unwrap();
                        Course2Response::from_course(course, account)
                    })
                    .collect();

                serde_json::to_string(&courses).unwrap()
            }
            Err(e) => e.to_string(),
        }
    }

    pub fn get_account(&self, account_id: ObjectId) -> Option<Account> {
        let mut account_res: Vec<Account> = self
            .accounts
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

    pub fn find_account(&self, filter: OrderedDocument) -> Option<Account> {
        dbg!(&filter);
        self.accounts
            .find_one(Some(filter), None)
            .unwrap()
            .map(|item| item.into())
    }

    pub fn get_accounts(&self, account_ids: Vec<bson::Bson>) -> Vec<Account> {
        self.accounts
            .find(
                Some(doc! {
                    "_id": {
                        "$in": account_ids
                    }
                }),
                None,
            )
            .unwrap()
            .map(|item| item.unwrap().into())
            .collect()
    }
}
