use crate::account::{Account, AccountReq};
use crate::config::get_google_client_id;
use crate::course2::{Course2, Course2Response, Course2SimilarityError};
use crate::database::Database;
use crate::minhash::{LshIndex, PermGen};
use crate::routes::{
    courses,
    courses2::{self, PutCourses2Response},
};
use crate::session::{AuthReq, AuthSession};

use brotli2::{read::BrotliEncoder, CompressParams};
use compression::prelude::*;
use mongodb::{oid::ObjectId, spec::BinarySubtype, Bson};
use rayon::prelude::*;
use std::{
    io::Read,
    sync::{Arc, Mutex},
};

const SIMILARITY_THRESHOLD: f64 = 0.98;

pub struct Data {
    database: Arc<Database>,
    pub google_client_id: String,
    pub perm_gen: PermGen,
    pub lsh_index: Arc<Mutex<LshIndex>>,
}

pub type ServerData = Arc<Data>;

impl Data {
    pub fn new(database: Arc<Database>) -> Self {
        let mut lsh_index = LshIndex::new(8);
        println!("Filling LshIndex");
        database.fill_lsh_index(&mut lsh_index);
        println!("Filling LshIndex completed!");
        Data {
            database,
            google_client_id: get_google_client_id(),
            perm_gen: PermGen::new(128),
            lsh_index: Arc::new(Mutex::new(lsh_index)),
        }
    }

    pub fn get_courses(
        &self,
        query: courses::GetCourses,
    ) -> Result<String, courses::GetCoursesError> {
        match query.into_ordered_document(&self.database) {
            Ok(query) => Ok(self.database.get_courses(query)),
            Err(error) => Err(error),
        }
    }

    pub fn get_courses2(
        &self,
        query: courses2::GetCourses2,
    ) -> Result<String, courses2::GetCourses2Error> {
        match query.into_ordered_document(&self.database) {
            Ok(query) => Ok(self.database.get_courses2(query)),
            Err(error) => Err(error),
        }
    }

    pub fn put_courses2(
        &self,
        mut courses: Vec<cemu_smm::Course2>,
        account: &Account,
    ) -> Result<PutCourses2Response, courses2::PutCourses2Error> {
        let lsh_index = self.lsh_index.clone();
        let response = Arc::new(Mutex::new(PutCourses2Response::new()));
        let succeeded: Vec<_> = courses
            .par_iter_mut()
            .map(
                |smm_course| -> Result<Course2Response, courses2::PutCourses2Error> {
                    let mut course =
                        Course2::insert(account.get_id_ref().clone(), smm_course, &self.perm_gen);
                    {
                        let mut lsh_index = lsh_index.lock().unwrap();
                        let query: Vec<Bson> = lsh_index
                            .query(course.get_hash())
                            .into_iter()
                            .map(|id| -> Bson { ObjectId::with_string(&id).unwrap().into() })
                            .collect();
                        let query = doc! {
                            "_id" => {
                                "$in" => query
                            }
                        };
                        let similar_courses = self.database.find_courses2(query)?;
                        for similar_course in similar_courses {
                            let jaccard = course.get_hash().jaccard(similar_course.get_hash());
                            if jaccard > SIMILARITY_THRESHOLD {
                                return Err(courses2::PutCourses2Error::Similarity(
                                    Course2SimilarityError::new(
                                        similar_course.get_id().to_hex(),
                                        jaccard,
                                    ),
                                ));
                            }
                        }

                        let course_meta = serde_json::to_value(&course)?;

                        let data_gz = smm_course
                            .get_course_data()
                            .iter()
                            .cloned()
                            .encode(&mut GZipEncoder::new(), Action::Finish)
                            .collect::<Result<Vec<_>, _>>()?;
                        let data_gz = Bson::Binary(BinarySubtype::Generic, data_gz);

                        let mut data_br = vec![];
                        let mut params = CompressParams::new();
                        params.quality(11);
                        BrotliEncoder::from_params(&smm_course.get_course_data()[..], &params)
                            .read_to_end(&mut data_br)?;
                        let data_br = Bson::Binary(BinarySubtype::Generic, data_br);

                        let course_thumb = smm_course
                            .get_course_thumb_mut()
                            .ok_or(courses2::PutCourses2Error::ThumbnailMissing)?;
                        let thumb =
                            Bson::Binary(BinarySubtype::Generic, course_thumb.get_jpeg().to_vec());

                        if let Bson::Document(doc_meta) = Bson::from(course_meta) {
                            let inserted_id = self
                                .database
                                .put_course2(doc_meta, data_gz, data_br, thumb)?;
                            course.set_id(inserted_id.clone());
                            lsh_index.insert(course.get_id().to_hex(), course.get_hash());
                            let course = Course2Response::from_course(course, account);
                            Ok(course)
                        } else {
                            Err(mongodb::Error::DefaultError("".to_string()).into())
                        }
                    }
                },
            )
            .filter_map(|course| {
                if let Err(err) = course {
                    response.lock().unwrap().add_failed(err);
                    None
                } else {
                    Result::ok(course)
                }
            })
            .collect();
        let mut response = Arc::try_unwrap(response).unwrap().into_inner().unwrap();
        response.set_succeeded(succeeded);
        Ok(response)
    }

    pub fn delete_course2(&self, course_id: ObjectId) -> Result<(), mongodb::Error> {
        let query = doc! {
            "_id" => course_id
        };
        self.database.delete_course2(query)
    }

    pub fn add_or_get_account(
        &self,
        account: AccountReq,
        session: AuthSession,
    ) -> Result<Account, mongodb::Error> {
        match self.database.find_account(account.as_find()) {
            Some(account) => {
                self.database
                    .store_account_session(account.get_id_ref(), session)?;
                Ok(account)
            }
            None => self.database.add_account(account, session),
        }
    }

    pub fn get_account_from_auth(&self, auth_req: AuthReq) -> Option<Account> {
        self.database.find_account(auth_req.into())
    }
}
