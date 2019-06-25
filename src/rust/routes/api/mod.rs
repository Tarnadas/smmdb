use actix_web::{dev, web};

mod get_courses;

pub use get_courses::GetCourses;

pub fn service() -> impl dev::HttpServiceFactory {
    web::scope("/api/").service(get_courses::get_courses)
}
