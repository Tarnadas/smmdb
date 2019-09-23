mod response;

pub use self::response::Course2Response;

use crate::minhash::{MinHash, PermGen};

use cemu_smm::proto::SMM2Course::{
    SMM2Course, SMM2CourseArea_AutoScroll, SMM2CourseArea_CourseTheme, SMM2CourseHeader_GameStyle,
};
use mongodb::{oid::ObjectId, ordered::OrderedDocument, Bson, ValueAccessError};
use serde::{Deserialize, Serialize};
use std::{convert::TryFrom, fmt};

#[derive(Debug, Deserialize, Serialize)]
pub struct Course2 {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    id: Option<ObjectId>,
    owner: ObjectId,
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
    pub fn insert(owner: ObjectId, course: &cemu_smm::Course2, perm_gen: &PermGen) -> Self {
        let mut hash = MinHash::new(&perm_gen);
        hash.update(&perm_gen, course.get_course_data());
        Course2 {
            id: None,
            owner,
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

    pub fn get_course(&self) -> &SMM2Course {
        &self.course
    }

    pub fn get_hash(&self) -> &MinHash {
        &self.hash
    }

    fn map_to_auto_scroll(
        document: &OrderedDocument,
        identifier: &str,
    ) -> Result<SMM2CourseArea_AutoScroll, ValueAccessError> {
        match document.get_i32(identifier)? {
            0 => Ok(SMM2CourseArea_AutoScroll::NONE),
            1 => Ok(SMM2CourseArea_AutoScroll::SLOW),
            2 => Ok(SMM2CourseArea_AutoScroll::MEDIUM),
            3 => Ok(SMM2CourseArea_AutoScroll::FAST),
            4 => Ok(SMM2CourseArea_AutoScroll::CUSTOM),
            _ => Err(ValueAccessError::UnexpectedType),
        }
    }

    fn map_to_course_theme(
        document: &OrderedDocument,
        identifier: &str,
    ) -> Result<SMM2CourseArea_CourseTheme, ValueAccessError> {
        match document.get_i32(identifier)? {
            0 => Ok(SMM2CourseArea_CourseTheme::GROUND),
            1 => Ok(SMM2CourseArea_CourseTheme::UNDERGROUND),
            2 => Ok(SMM2CourseArea_CourseTheme::CASTLE),
            3 => Ok(SMM2CourseArea_CourseTheme::AIRSHIP),
            4 => Ok(SMM2CourseArea_CourseTheme::UNDERWATER),
            5 => Ok(SMM2CourseArea_CourseTheme::GHOUST_HOUSE),
            6 => Ok(SMM2CourseArea_CourseTheme::SNOW),
            7 => Ok(SMM2CourseArea_CourseTheme::DESERT),
            8 => Ok(SMM2CourseArea_CourseTheme::SKY),
            9 => Ok(SMM2CourseArea_CourseTheme::FOREST),
            _ => Err(ValueAccessError::UnexpectedType),
        }
    }

    fn map_to_game_style(
        document: &OrderedDocument,
        identifier: &str,
    ) -> Result<SMM2CourseHeader_GameStyle, ValueAccessError> {
        match document.get_i32(identifier)? {
            0 => Ok(SMM2CourseHeader_GameStyle::M1),
            1 => Ok(SMM2CourseHeader_GameStyle::M3),
            2 => Ok(SMM2CourseHeader_GameStyle::MW),
            3 => Ok(SMM2CourseHeader_GameStyle::WU),
            4 => Ok(SMM2CourseHeader_GameStyle::W3),
            _ => Err(ValueAccessError::UnexpectedType),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Course2SimilarityError {
    similar_course_id: String,
    jaccard: f64,
}

impl Course2SimilarityError {
    pub fn new(similar_course_id: String, jaccard: f64) -> Self {
        Course2SimilarityError {
            similar_course_id,
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
