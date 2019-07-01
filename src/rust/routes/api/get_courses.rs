use crate::server::ServerData;
use crate::Database;
use actix_web::{error::ResponseError, get, http::StatusCode, web, HttpRequest, HttpResponse};
use cemu_smm::proto::SMMCourse::{
    SMMCourse_AutoScroll, SMMCourse_CourseTheme, SMMCourse_GameStyle,
};
use mongodb::{oid::ObjectId, ordered::OrderedDocument, Bson};
use protobuf::ProtobufEnum;
use serde::Deserialize;
use serde_qs::actix::QsQuery;
use std::sync::MutexGuard;

#[get("/getcourses")]
pub fn get_courses(
    data: web::Data<ServerData>,
    query: QsQuery<GetCourses>,
    req: HttpRequest,
) -> Result<String, GetCoursesError> {
    data.get_courses(query.into_inner())
}

#[derive(Deserialize, Debug)]
pub struct GetCourses {
    #[serde(default)]
    limit: Limit,
    skip: Option<u32>,
    id: Option<String>,
    ids: Option<Vec<String>>,
    title: Option<String>,
    maker: Option<String>,
    owner: Option<String>,
    uploader: Option<String>,
    game_style: Option<Vec<SMMCourse_GameStyle>>,
    course_theme: Option<Vec<SMMCourse_CourseTheme>>,
    course_theme_sub: Option<Vec<SMMCourse_CourseTheme>>,
    auto_scroll: Option<Vec<SMMCourse_AutoScroll>>,
    auto_scroll_sub: Option<Vec<SMMCourse_AutoScroll>>,
    width_from: Option<i32>,
    width_to: Option<i32>,
    width_sub_from: Option<i32>,
    width_sub_to: Option<i32>,
    nintendoid: Option<String>,
    difficulty_from: Option<u32>,
    difficulty_to: Option<u32>,
    videoid: Option<String>,
    lastmodified_from: Option<u32>,
    lastmodified_to: Option<u32>,
    uploaded_from: Option<u32>,
    uploaded_to: Option<u32>,
    stars_from: Option<u32>,
    stars_to: Option<u32>,
}

impl GetCourses {
    pub fn into_ordered_document(
        self,
        database: &MutexGuard<Database>,
    ) -> Result<Vec<OrderedDocument>, GetCoursesError> {
        let mut pipeline = vec![];

        if let Some(pipeline_match) = self.get_match(database)? {
            pipeline.push(doc! { "$match" => pipeline_match });
        }

        let limit = self.get_limit()?;
        pipeline.push(doc! {
            "$limit" => limit
        });

        if let Some(skip) = self.skip {
            pipeline.push(doc! {
                "$skip" => skip
            });
        }

        Ok(pipeline)
    }

    fn get_match(
        &self,
        database: &MutexGuard<Database>,
    ) -> Result<Option<OrderedDocument>, GetCoursesError> {
        let mut res = doc! {};
        if let Some(id) = &self.id {
            res.insert_bson(
                "_id".to_string(),
                Bson::ObjectId(
                    ObjectId::with_string(id)
                        .map_err(|_| GetCoursesError::DeserializeError("id".to_string()))?,
                ),
            );
        }

        if let Some(ids) = self.ids.clone() {
            let ids: Vec<Bson> = ids
                .iter()
                .map(|id| -> Result<Bson, GetCoursesError> {
                    let object_id = ObjectId::with_string(id)
                        .map_err(|_| GetCoursesError::DeserializeError("ids".to_string()))?;
                    Ok(Bson::ObjectId(object_id))
                })
                .filter_map(Result::ok)
                .collect();
            res.insert_bson(
                "_id".to_string(),
                Bson::Document(doc! {
                    "$in" => ids
                }),
            );
        }

        if let Some(title) = self.title.clone() {
            res.insert_bson(
                "title".to_string(),
                Bson::RegExp(format!(".*{}.*", title), "i".to_string()),
            );
        }

        if let Some(maker) = self.maker.clone() {
            res.insert_bson(
                "maker".to_string(),
                Bson::RegExp(format!(".*{}.*", maker), "i".to_string()),
            );
        }

        if let Some(owner) = &self.owner {
            res.insert_bson(
                "owner".to_string(),
                Bson::ObjectId(
                    ObjectId::with_string(owner)
                        .map_err(|_| GetCoursesError::DeserializeError("owner".to_string()))?,
                ),
            );
        }

        if let Some(uploader) = &self.uploader {
            let filter = doc! {
                "username" => Bson::RegExp(format!("^{}$", uploader), "i".to_string())
            };
            match database.find_account(filter) {
                Some(account) => {
                    res.insert_bson("owner".to_string(), Bson::ObjectId(account.get_id()));
                }
                None => return Err(GetCoursesError::UploaderUnknown(uploader.clone())),
            };
        }

        if let Some(game_styles) = &self.game_style {
            let game_styles: Vec<Bson> = game_styles
                .iter()
                .map(|game_style| Bson::I32(game_style.value()))
                .collect();
            res.insert_bson(
                "gameStyle".to_string(),
                Bson::Document(doc! {
                    "$in" => game_styles
                }),
            );
        }

        if let Some(course_themes) = &self.course_theme {
            let course_themes: Vec<Bson> = course_themes
                .iter()
                .map(|course_theme| Bson::I32(course_theme.value()))
                .collect();
            res.insert_bson(
                "courseTheme".to_string(),
                Bson::Document(doc! {
                    "$in" => course_themes
                }),
            );
        }

        if let Some(course_themes) = &self.course_theme_sub {
            let course_themes: Vec<Bson> = course_themes
                .iter()
                .map(|course_theme| Bson::I32(course_theme.value()))
                .collect();
            res.insert_bson(
                "courseThemeSub".to_string(),
                Bson::Document(doc! {
                    "$in" => course_themes
                }),
            );
        }

        match res.is_empty() {
            true => Ok(None),
            false => Ok(Some(res)),
        }
    }

    fn get_limit(&self) -> Result<u32, GetCoursesError> {
        let limit = self.limit.0;
        if limit <= 0 {
            return Err(GetCoursesError::LimitTooLow);
        }
        if limit > 120 {
            return Err(GetCoursesError::LimitTooHigh);
        }
        Ok(limit + self.skip.unwrap_or_default())
    }
}

#[derive(Deserialize, Debug)]
struct Limit(u32);

impl Default for Limit {
    fn default() -> Limit {
        Limit(120)
    }
}

#[derive(Fail, Debug)]
pub enum GetCoursesError {
    #[fail(display = "limit must be at least 1")]
    LimitTooLow,
    #[fail(display = "limit must be at most 120")]
    LimitTooHigh,
    #[fail(display = "could not deserialize {} fom hex string", _0)]
    DeserializeError(String),
    #[fail(display = "uploader with name {} unknown", _0)]
    UploaderUnknown(String),
}

impl ResponseError for GetCoursesError {
    fn error_response(&self) -> HttpResponse {
        match *self {
            GetCoursesError::LimitTooLow => HttpResponse::new(StatusCode::BAD_REQUEST),
            GetCoursesError::LimitTooHigh => HttpResponse::new(StatusCode::BAD_REQUEST),
            GetCoursesError::DeserializeError(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
            GetCoursesError::UploaderUnknown(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
        }
    }
}
