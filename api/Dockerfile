FROM debian:buster-slim

COPY --from=tarnadas/smmdb-api-build /smmdb/target/release/smmdb .

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
    pkg-config \
    openssl \
    libssl-dev \
    ; \
    \
    rm -rf /var/lib/apt/lists/*;

ENV DOCKER=true
ARG GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
EXPOSE 3030

CMD ["./smmdb"]
