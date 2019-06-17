pub enum Collections {
    Courses,
}

impl Collections {
    pub fn as_str(&self) -> &str {
        match self {
            &Collections::Courses => "courses",
        }
    }
}
