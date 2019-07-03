FROM rust:1.35 as build

WORKDIR /smmdb

COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock

RUN cargo build --release
RUN rm src/*.rs

COPY ./src/rust ./src/rust

RUN rm ./target/release/deps/smmdb*
RUN cargo build --release

FROM jessie-slim

COPY --from=build /smmdb/target/release/smmdb .

CMD ["./smmdb"]