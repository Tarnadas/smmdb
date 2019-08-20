FROM debian:jessie-slim

COPY --from=tarnadas/smmdb-api-build /smmdb/target/release/smmdb .

ENV DOCKER=true
EXPOSE 3030
CMD ["./smmdb"]
