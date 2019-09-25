use super::Course2;
use crate::account::Account;

use cemu_smm::proto::SMM2Course::SMM2Course;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Course2Response {
    id: String,
    owner: String,
    uploader: String,
    last_modified: i64,
    uploaded: i64,
    course: SMM2Course,
}

impl Course2Response {
    pub fn from_course(course: Course2, account: &Account) -> Course2Response {
        Course2Response {
            id: course.get_id().to_hex(),
            owner: course.owner.to_hex(),
            uploader: account.get_username().clone(),
            last_modified: course.get_last_modified(),
            uploaded: course.get_uploaded(),
            course: course.course,
        }
    }
}
