use cemu_smm::proto::SMMCourse::{SMMCourse_CourseTheme, SMMCourse_GameStyle};
use mongodb::{ordered::OrderedDocument, ValueAccessError};
use protobuf::ProtobufEnum;
use serde::{Serialize, Serializer};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Course {
    title: String,
    maker: String,
    game_style: SMMCourse_GameStyle,
    course_theme: SMMCourse_CourseTheme,
    course_theme_sub: SMMCourse_CourseTheme,
}

impl From<OrderedDocument> for Course {
    fn from(document: OrderedDocument) -> Course {
        Course {
            title: document.get_str("title").unwrap().to_string(),
            maker: document.get_str("maker").unwrap().to_string(),
            game_style: Course::map_to_game_style(&document, "gameStyle").unwrap(),
            course_theme: Course::map_to_course_theme(&document, "courseTheme").unwrap(),
            course_theme_sub: Course::map_to_course_theme(&document, "courseThemeSub").unwrap(),
        }
    }
}

impl Course {
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
