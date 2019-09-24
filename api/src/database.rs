use crate::account::{Account, AccountReq};
use crate::collections::Collections;
use crate::course::{Course, CourseResponse};
use crate::course2::{Course2, Course2Response};
use crate::minhash::{LshIndex, MinHash};
use crate::mongodb::coll::options::FindOptions;
use crate::session::AuthSession;

use mongodb::{
    coll::{results::InsertOneResult, Collection},
    db::ThreadedDatabase,
    oid::ObjectId,
    ordered::OrderedDocument,
    Bson, Client, ThreadedClient,
};
use std::{convert::TryInto, env};

pub struct Database {
    courses: Collection,
    course_data: Collection,
    courses2: Collection,
    course2_data: Collection,
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
        let course_data = client
            .db("admin")
            .collection(Collections::CourseData.as_str());
        let courses2 = client
            .db("admin")
            .collection(Collections::Courses2.as_str());
        let course2_data = client
            .db("admin")
            .collection(Collections::Course2Data.as_str());
        let accounts = client
            .db("admin")
            .collection(Collections::Accounts.as_str());

        Database {
            courses,
            course_data,
            courses2,
            course2_data,
            accounts,
        }
    }

    pub fn get_courses(&self, query: Vec<OrderedDocument>) -> String {
        match self.courses.aggregate(query, None) {
            Ok(cursor) => {
                let (account_ids, courses): (Vec<Bson>, Vec<Course>) = cursor
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
                let (account_ids, courses): (Vec<Bson>, Vec<Course2>) = cursor
                    .map(|item| -> Result<(Bson, Course2), serde_json::Error> {
                        let course: Course2 = item.unwrap().try_into()?;
                        Ok((course.get_owner().clone().into(), course))
                    })
                    .filter_map(Result::ok)
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

    pub fn fill_lsh_index(&self, lsh_index: &mut LshIndex) {
        if let Ok(cursor) = self.courses2.find(
            None,
            Some(FindOptions {
                projection: Some(doc! {
                    "hash" => 1
                }),
                ..Default::default()
            }),
        ) {
            cursor.filter_map(Result::ok).for_each(|item| {
                if let (Some(id), Some(hash)) = (item.get("_id"), item.get("hash")) {
                    let hash: serde_json::Value = hash.clone().into();
                    let hash: Result<MinHash, _> = serde_json::from_value(hash);
                    if let (Bson::ObjectId(id), Ok(hash)) = (id.clone(), hash) {
                        lsh_index.insert(id.to_hex(), &hash);
                    }
                }
            });
        }
    }

    pub fn put_course2(
        &self,
        doc_meta: OrderedDocument,
        data_gz: Bson,
        data_br: Bson,
        thumb: Bson,
    ) -> Result<ObjectId, mongodb::Error> {
        let insert_res = self.courses2.insert_one(doc_meta, None)?;
        let inserted_id = insert_res
            .inserted_id
            .ok_or_else(|| mongodb::Error::ResponseError("inserted_id not given".to_string()))?;
        let doc = doc! {
            "_id" => inserted_id.clone(),
            "data_gz" => data_gz,
            "data_br" => data_br,
            "thumb" => thumb,
        };
        self.course2_data.insert_one(doc, None)?;
        Ok(inserted_id.as_object_id().unwrap().clone())
    }

    pub fn find_courses2(&self, doc: OrderedDocument) -> Result<Vec<Course2>, mongodb::Error> {
        match self.courses2.find(Some(doc), None) {
            Ok(cursor) => {
                let courses: Vec<Course2> = cursor
                    .map(|item| -> Result<Course2, serde_json::Error> {
                        let course: Course2 = item.unwrap().try_into()?;
                        Ok(course)
                    })
                    .filter_map(Result::ok)
                    .collect();
                Ok(courses)
            }
            Err(err) => Err(err),
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
        self.accounts
            .find_one(Some(filter), None)
            .unwrap()
            .map(|item| item.into())
    }

    pub fn get_accounts(&self, account_ids: Vec<Bson>) -> Vec<Account> {
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

    pub fn add_account(
        &self,
        account: AccountReq,
        session: AuthSession,
    ) -> Result<Account, mongodb::Error> {
        let account_doc = account.clone().into_ordered_document();
        let res: InsertOneResult = self.accounts.insert_one(account_doc, None)?;
        Ok(Account::new(
            account,
            res.inserted_id
                .ok_or_else(|| mongodb::Error::ResponseError("insert_id missing".to_string()))?
                .as_object_id()
                .unwrap()
                .clone(),
            session,
        ))
    }

    pub fn store_account_session(
        &self,
        account_id: &ObjectId,
        session: AuthSession,
    ) -> Result<(), mongodb::Error> {
        let filter = doc! {
            "_id" => account_id.clone()
        };
        let session: OrderedDocument = session.into();
        let update = doc! {
            "$set" => {
                "session" => session
            }
        };
        self.accounts.update_one(filter, update, None)?;
        Ok(())
    }
}
