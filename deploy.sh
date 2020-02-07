#!/bin/bash
set -e
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker-compose -f docker-compose.build.yml pull --ignore-pull-failures
docker-compose -f docker-compose.build.yml build --parallel
docker tag tarnadas/smmdb-build:latest
docker tag tarnadas/smmdb-build-dep:latest
docker tag tarnadas/smmdb-api-build:latest
docker-compose -f docker-compose.build.yml bundle --push-images

docker-compose pull --ignore-pull-failures
docker-compose build --parallel
docker tag tarnadas/smmdb:latest
docker tag tarnadas/smmdb-api:latest
docker-compose bundle --push-images
