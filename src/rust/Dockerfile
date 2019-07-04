FROM rust:1.35 as build

RUN USER=root cargo new --bin smmdb
WORKDIR /smmdb

COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock
RUN mkdir ./src/rust
RUN echo "fn main() {}" >> ./src/rust/main.rs

RUN cargo build --release
RUN rm src/*.rs

COPY ./src/rust ./src/rust

RUN rm ./target/release/deps/smmdb*
RUN cargo build --release

FROM jessie-slim

COPY --from=build /smmdb/target/release/smmdb .

CMD ["./smmdb"]