mod response;

pub use self::response::Course2Response;

use crate::minhash::{MinHash, PermGen};

use bson::{oid::ObjectId, ordered::OrderedDocument, Bson};
use cemu_smm::proto::SMM2Course::SMM2Course;
use chrono::offset::Utc;
use serde::{Deserialize, Serialize};
use std::{convert::TryFrom, fmt};

#[derive(Debug, Deserialize, Serialize)]
pub struct Course2 {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    id: Option<ObjectId>,
    owner: ObjectId,
    last_modified: i64,
    uploaded: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    difficulty: Option<Difficulty>,
    course: SMM2Course,
    hash: MinHash,
}

impl TryFrom<OrderedDocument> for Course2 {
    type Error = serde_json::Error;

    fn try_from(document: OrderedDocument) -> Result<Course2, Self::Error> {
        let course = Bson::from(document);
        let course: serde_json::Value = course.into();
        Ok(serde_json::from_value(course)?)
    }
}

impl Course2 {
    pub fn insert(
        owner: ObjectId,
        course: &cemu_smm::Course2,
        difficulty: Option<Difficulty>,
        perm_gen: &PermGen,
    ) -> Self {
        let mut hash = MinHash::new(&perm_gen);
        hash.update(&perm_gen, course.get_course_data());
        let uploaded = Utc::now().timestamp_millis();
        Course2 {
            id: None,
            owner,
            last_modified: uploaded,
            uploaded,
            difficulty,
            course: course.get_course().clone(),
            hash,
        }
    }

    pub fn set_id(&mut self, id: ObjectId) {
        self.id = Some(id);
    }

    pub fn get_id(&self) -> &ObjectId {
        &self.id.as_ref().unwrap()
    }

    pub fn get_owner(&self) -> &ObjectId {
        &self.owner
    }

    pub fn get_difficulty(&self) -> &Option<Difficulty> {
        &self.difficulty
    }

    pub fn get_last_modified(&self) -> i64 {
        self.last_modified
    }

    pub fn get_uploaded(&self) -> i64 {
        self.uploaded
    }

    pub fn get_course(&self) -> &SMM2Course {
        &self.course
    }

    pub fn get_hash(&self) -> &MinHash {
        &self.hash
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Course2SimilarityError {
    similar_course_id: String,
    title: String,
    jaccard: f64,
}

impl Course2SimilarityError {
    pub fn new(similar_course_id: String, title: String, jaccard: f64) -> Self {
        Course2SimilarityError {
            similar_course_id,
            title,
            jaccard,
        }
    }
}

impl fmt::Display for Course2SimilarityError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match serde_json::to_string(&self) {
            Ok(res) => write!(f, "{}", res),
            Err(_) => fmt::Result::Err(fmt::Error),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum Difficulty {
    Easy,
    Normal,
    Expert,
    SuperExpert,
}

impl From<Difficulty> for Bson {
    fn from(difficulty: Difficulty) -> Bson {
        Bson::String(
            serde_json::to_value(difficulty)
                .unwrap()
                .as_str()
                .unwrap()
                .to_string(),
        )
    }
}
