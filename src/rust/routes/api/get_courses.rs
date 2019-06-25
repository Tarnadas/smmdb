use crate::server::ServerData;

use actix_web::{get, web, HttpRequest};
use cemu_smm::proto::SMMCourse::{
    SMMCourse_AutoScroll, SMMCourse_CourseTheme, SMMCourse_GameStyle,
};
use serde::Deserialize;

#[get("/getcourses")]
pub fn get_courses(
    data: web::Data<ServerData>,
    query: web::Query<GetCourses>,
    req: HttpRequest,
) -> String {
    data.get_courses(query.into_inner())
}

#[derive(Deserialize, Debug)]
pub struct GetCourses {
    limit: Option<u32>,
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

impl Into<Vec<mongodb::ordered::OrderedDocument>> for GetCourses {
    fn into(self) -> Vec<mongodb::ordered::OrderedDocument> {
        let mut pipeline = vec![];
        if let Some(limit) = self.limit {
            pipeline.push(doc! {
                "$limit" => limit + self.skip.unwrap_or_default()
            });
        }
        if let Some(skip) = self.skip {
            pipeline.push(doc! {
                "$skip" => skip
            });
        }
        pipeline
    }
}
