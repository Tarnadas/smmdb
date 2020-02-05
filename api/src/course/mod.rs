mod response;

pub use self::response::CourseResponse;

use bson::{oid::ObjectId, ordered::OrderedDocument, ValueAccessError};
use cemu_smm::proto::SMMCourse::{
    SMMCourse_AutoScroll, SMMCourse_CourseTheme, SMMCourse_GameStyle,
};
use serde::Serialize;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Course {
    #[serde(rename = "_id")]
    id: ObjectId,
    title: String,
    maker: String,
    owner: ObjectId,
    #[serde(skip_serializing_if = "Option::is_none")]
    description: Option<String>,
    game_style: SMMCourse_GameStyle,
    course_theme: SMMCourse_CourseTheme,
    course_theme_sub: SMMCourse_CourseTheme,
    auto_scroll: SMMCourse_AutoScroll,
    auto_scroll_sub: SMMCourse_AutoScroll,
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

impl From<OrderedDocument> for Course {
    fn from(document: OrderedDocument) -> Course {
        Course {
            id: document
                .get_object_id("_id")
                .expect("[Course::from] id unwrap failed")
                .to_owned(),
            title: document
                .get_str("title")
                .expect("[Course::from] title unwrap failed")
                .to_string(),
            maker: document
                .get_str("maker")
                .expect("[Course::from] maker unwrap failed")
                .to_string(),
            owner: document
                .get_object_id("owner")
                .expect("[Course::from] owner unwrap failed")
                .to_owned(),
            description: document.get_str("description").ok().map(|d| d.to_string()),
            game_style: Course::map_to_game_style(&document, "gameStyle")
                .expect("[Course::from] game_style unwrap failed"),
            course_theme: Course::map_to_course_theme(&document, "courseTheme")
                .expect("[Course::from] course_theme unwrap failed"),
            course_theme_sub: Course::map_to_course_theme(&document, "courseThemeSub")
                .expect("[Course::from] course_theme_sub unwrap failed"),
            auto_scroll: Course::map_to_auto_scroll(&document, "autoScroll")
                .expect("[Course::from] auto_scroll unwrap failed"),
            auto_scroll_sub: Course::map_to_auto_scroll(&document, "autoScrollSub")
                .expect("[Course::from] auto_scroll_sub unwrap failed"),
            width: document
                .get_i32("width")
                .expect("[Course::from] width unwrap failed"),
            width_sub: document
                .get_i32("widthSub")
                .expect("[Course::from] width_sub unwrap failed"),
            nintendoid: document.get_str("nintendoid").ok().map(|u| u.to_string()),
            difficulty: document.get_i32("difficulty").ok(),
            videoid: document.get_str("videoid").ok().map(|id| id.to_string()),
            lastmodified: document
                .get_i32("lastmodified")
                .expect("[Course::from] lastmodified unwrap failed"),
            uploaded: document
                .get_i32("uploaded")
                .expect("[Course::from] uploaded unwrap failed"),
            v_full: document.get_i32("vFull").ok(),
            v_prev: document.get_i32("vPrev").ok(),
            stars: document.get_i32("stars").ok(),
        }
    }
}

impl Course {
    pub fn get_owner(&self) -> &ObjectId {
        &self.owner
    }

    fn map_to_auto_scroll(
        document: &OrderedDocument,
        identifier: &str,
    ) -> Result<SMMCourse_AutoScroll, ValueAccessError> {
        match document.get_i32(identifier)? {
            0 => Ok(SMMCourse_AutoScroll::DISABLED),
            1 => Ok(SMMCourse_AutoScroll::SLOW),
            2 => Ok(SMMCourse_AutoScroll::MEDIUM),
            3 => Ok(SMMCourse_AutoScroll::FAST),
            4 => Ok(SMMCourse_AutoScroll::LOCK),
            _ => Err(ValueAccessError::UnexpectedType),
        }
    }

    fn map_to_course_theme(
        document: &OrderedDocument,
        identifier: &str,
    ) -> Result<SMMCourse_CourseTheme, ValueAccessError> {
        match document.get_i32(identifier)? {
            0 => Ok(SMMCourse_CourseTheme::GROUND),
            1 => Ok(SMMCourse_CourseTheme::UNDERGROUND),
            2 => Ok(SMMCourse_CourseTheme::CASTLE),
            3 => Ok(SMMCourse_CourseTheme::AIRSHIP),
            4 => Ok(SMMCourse_CourseTheme::UNDERWATER),
            5 => Ok(SMMCourse_CourseTheme::GHOUST_HOUSE),
            _ => Err(ValueAccessError::UnexpectedType),
        }
    }

    fn map_to_game_style(
        document: &OrderedDocument,
        identifier: &str,
    ) -> Result<SMMCourse_GameStyle, ValueAccessError> {
        match document.get_i32(identifier)? {
            0 => Ok(SMMCourse_GameStyle::M1),
            1 => Ok(SMMCourse_GameStyle::M3),
            2 => Ok(SMMCourse_GameStyle::MW),
            3 => Ok(SMMCourse_GameStyle::WU),
            _ => Err(ValueAccessError::UnexpectedType),
        }
    }
}
