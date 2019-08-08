mod response;

pub use self::response::Course2Response;

use cemu_smm::proto::SMM2Course::{
    SMM2CourseArea_AutoScroll, SMM2CourseArea_CourseTheme, SMM2CourseHeader_GameStyle,
};
use mongodb::oid::ObjectId;
use mongodb::{ordered::OrderedDocument, ValueAccessError};
use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Course2 {
    #[serde(rename = "_id")]
    id: ObjectId,
    title: String,
    maker: String,
    owner: ObjectId,
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
    game_style: SMM2CourseHeader_GameStyle,
    course_theme: SMM2CourseArea_CourseTheme,
    course_theme_sub: SMM2CourseArea_CourseTheme,
    auto_scroll: SMM2CourseArea_AutoScroll,
    auto_scroll_sub: SMM2CourseArea_AutoScroll,
    width: i32,
    width_sub: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    nintendoid: Option<String>,
    difficulty: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    videoid: Option<String>,
    lastmodified: i32,
    uploaded: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    v_full: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    v_prev: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    stars: Option<i32>,
}

impl From<OrderedDocument> for Course2 {
    fn from(document: OrderedDocument) -> Course2 {
        Course2 {
            id: document
                .get_object_id("_id")
                .expect("[Course2::from] id unwrap failed")
                .to_owned(),
            title: document
                .get_str("title")
                .expect("[Course2::from] title unwrap failed")
                .to_string(),
            maker: document
                .get_str("maker")
                .expect("[Course2::from] maker unwrap failed")
                .to_string(),
            owner: document
                .get_object_id("owner")
                .expect("[Course2::from] owner unwrap failed")
                .to_owned(),
            description: document.get_str("description").ok().map(|d| d.to_string()),
            game_style: Course2::map_to_game_style(&document, "gameStyle")
                .expect("[Course2::from] game_style unwrap failed"),
            course_theme: Course2::map_to_course_theme(&document, "courseTheme")
                .expect("[Course2::from] course_theme unwrap failed"),
            course_theme_sub: Course2::map_to_course_theme(&document, "courseThemeSub")
                .expect("[Course2::from] course_theme_sub unwrap failed"),
            auto_scroll: Course2::map_to_auto_scroll(&document, "autoScroll")
                .expect("[Course2::from] auto_scroll unwrap failed"),
            auto_scroll_sub: Course2::map_to_auto_scroll(&document, "autoScrollSub")
                .expect("[Course2::from] auto_scroll_sub unwrap failed"),
            width: document
                .get_i32("width")
                .expect("[Course2::from] width unwrap failed"),
            width_sub: document
                .get_i32("widthSub")
                .expect("[Course2::from] width_sub unwrap failed"),
            nintendoid: document.get_str("nintendoid").ok().map(|u| u.to_string()),
            difficulty: document.get_i32("difficulty").ok(),
            videoid: document.get_str("videoid").ok().map(|id| id.to_string()),
            lastmodified: document
                .get_i32("lastmodified")
                .expect("[Course2::from] lastmodified unwrap failed"),
            uploaded: document
                .get_i32("uploaded")
                .expect("[Course2::from] uploaded unwrap failed"),
            v_full: document.get_i32("vFull").ok(),
            v_prev: document.get_i32("vPrev").ok(),
            stars: document.get_i32("stars").ok(),
        }
    }
}

impl Course2 {
    pub fn get_owner(&self) -> &ObjectId {
        &self.owner
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
