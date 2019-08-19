pub enum Collections {
    Courses,
    Courses2,
    Accounts,
}

impl Collections {
    pub fn as_str(&self) -> &str {
        match self {
            &Collections::Courses => "courses",
            &Collections::Courses2 => "courses2",
            &Collections::Accounts => "accounts",
        }
    }
}
