use crate::server::ServerData;

use actix_web::{get, web, HttpRequest};

#[get("/getcourses/{course_id}")]
pub fn get_courses_by_id(
    data: web::Data<ServerData>,
    req: HttpRequest,
    course_id: web::Path<String>,
) -> String {
    data.get_courses()
}

#[get("/getcourses")]
pub fn get_courses(data: web::Data<ServerData>, req: HttpRequest) -> String {
    data.get_courses()
}
