FROM rust:1.35

WORKDIR /usr/src/app
COPY ./src/rust ./src/rust
COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock

RUN cargo install --path .

CMD ["smmdb"]