use crate::server::ServerData;

use actix_web::{error::ResponseError, get, http::StatusCode, web, HttpRequest, HttpResponse};
use cemu_smm::proto::SMMCourse::{
    SMMCourse_AutoScroll, SMMCourse_CourseTheme, SMMCourse_GameStyle,
};
use mongodb::ordered::OrderedDocument;
use serde::Deserialize;

#[get("/getcourses")]
pub fn get_courses(
    data: web::Data<ServerData>,
    query: web::Query<GetCourses>,
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
        let mut limit = self.limit.0;
        if limit <= 0 {
            return Err(GetCoursesError::LimitTooLow);
        }
        if limit > 120 {
            return Err(GetCoursesError::LimitTooHigh);
        }
        limit = limit + self.skip.unwrap_or_default();
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
}

impl ResponseError for GetCoursesError {
    fn error_response(&self) -> HttpResponse {
        match *self {
            GetCoursesError::LimitTooLow => HttpResponse::new(StatusCode::BAD_REQUEST),
            GetCoursesError::LimitTooHigh => HttpResponse::new(StatusCode::BAD_REQUEST),
        }
    }
}
