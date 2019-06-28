use crate::server::ServerData;

use actix_web::{error::ResponseError, get, http::StatusCode, web, HttpRequest, HttpResponse};
use cemu_smm::proto::SMMCourse::{
    SMMCourse_AutoScroll, SMMCourse_CourseTheme, SMMCourse_GameStyle,
};
use mongodb::{oid::{self, ObjectId}, ordered::OrderedDocument, Bson};
use serde::Deserialize;
use serde_qs::actix::QsQuery;

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
    fn get_match(&self) -> Result<Option<OrderedDocument>, GetCoursesError> {
        let mut res = doc! {};
        if let Some(id) = &self.id {
            res.insert_bson(
                "_id".to_string(),
                Bson::ObjectId(
                    ObjectId::with_string(id).map_err(|e| GetCoursesError::IdDeserializeError(e))?,
                ),
            );
        }

        if let Some(ids) = self.ids.clone() {
            let ids: Vec<Bson> = ids
                .iter()
                .map(|id| -> Result<Bson, GetCoursesError> {
                    let object_id = ObjectId::with_string(id)
                        .map_err(|e| GetCoursesError::IdDeserializeError(e))?;
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

        // if let Some(title) = self.title {
        //     res.insert_bson("title", )
        // }
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

impl Into<Result<Vec<OrderedDocument>, GetCoursesError>> for GetCourses {
    fn into(self) -> Result<Vec<OrderedDocument>, GetCoursesError> {
        let mut pipeline = vec![];

        if let Some(pipeline_match) = self.get_match()? {
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
}

#[derive(Fail, Debug)]
pub enum GetCoursesError {
    #[fail(display = "limit must be at least 1")]
    LimitTooLow,
    #[fail(display = "limit must be at most 120")]
    LimitTooHigh,
    #[fail(display = "could not deserialize id fom hex string")]
    IdDeserializeError(oid::Error),
}

impl ResponseError for GetCoursesError {
    fn error_response(&self) -> HttpResponse {
        match *self {
            GetCoursesError::LimitTooLow => HttpResponse::new(StatusCode::BAD_REQUEST),
            GetCoursesError::LimitTooHigh => HttpResponse::new(StatusCode::BAD_REQUEST),
            GetCoursesError::IdDeserializeError(_) => HttpResponse::new(StatusCode::BAD_REQUEST),
        }
    }
}
