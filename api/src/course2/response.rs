use super::Course2;
use crate::account::Account;
use cemu_smm::proto::SMM2Course::SMM2Course;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Course2Response {
    owner: String,
    maker: String,
    course: SMM2Course,
}

impl Course2Response {
    pub fn from_course(course: Course2, account: &Account) -> Course2Response {
        Course2Response {
            owner: course.owner.to_hex(),
            maker: account.get_username().clone(),
            course: course.course,
        }
    }
}
