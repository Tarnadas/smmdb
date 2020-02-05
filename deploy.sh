#!/bin/bash
set -e
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker-compose -f docker-compose.build.yml pull --ignore-pull-failures
docker-compose -f docker-compose.build.yml build --parallel
docker-compose -f docker-compose.build.yml bundle --push-images

docker-compose pull --ignore-pull-failures
docker-compose build --parallel
docker-compose bundle --push-images
