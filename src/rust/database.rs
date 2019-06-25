use crate::account::Account;
use crate::collections::Collections;
use crate::course::{Course, CourseResponse};
use crate::routes::api;

use mongodb::db::ThreadedDatabase;
use mongodb::oid::ObjectId;
use mongodb::{coll::Collection, Client, ThreadedClient};

pub struct Database {
    client: Client,
    courses: Collection,
    accounts: Collection,
}

impl Database {
    pub fn new() -> Self {
        let client = Client::with_uri("mongodb://localhost:27017")
            .expect("Failed to initialize standalone client.");
        let courses = client.db("admin").collection(Collections::Courses.as_str());
        let accounts = client
            .db("admin")
            .collection(Collections::Accounts.as_str());

        Database {
            client,
            courses,
            accounts,
        }
    }

    pub fn get_courses(&self, query: api::GetCourses) -> String {
        match self.courses.aggregate(query.into(), None) {
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
                                account.get_id().to_string() == course.get_owner().to_string()
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
