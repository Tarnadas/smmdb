#!/bin/bash
set -e
GIT_HASH=$(git rev-parse HEAD)
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker-compose -f docker-compose.build.yml pull --ignore-pull-failures
docker-compose -f docker-compose.build.yml build --parallel
docker tag tarnadas/smmdb-build tarnadas/smmdb-build:$GIT_HASH
docker tag tarnadas/smmdb-build-dep tarnadas/smmdb-build-dep:$GIT_HASH
docker tag tarnadas/smmdb-api-build tarnadas/smmdb-api-build:$GIT_HASH
docker-compose -f docker-compose.build.yml bundle --push-images

docker-compose pull --ignore-pull-failures
docker-compose build --parallel
docker tag tarnadas/smmdb tarnadas/smmdb:$GIT_HASH
docker tag tarnadas/smmdb-api tarnadas/smmdb-api:$GIT_HASH
docker-compose bundle --push-images
