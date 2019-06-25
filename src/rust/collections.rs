pub enum Collections {
    Courses,
    Accounts,
}

impl Collections {
    pub fn as_str(&self) -> &str {
        match self {
            &Collections::Courses => "courses",
            &Collections::Accounts => "accounts",
        }
    }
}
