FROM debian:jessie-slim

COPY --from=tarnadas/smmdb-api-build /smmdb/target/release/smmdb .

ENV DOCKER=true
ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
EXPOSE 3030

CMD ["./smmdb"]
