#!/bin/bash
set -e
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker-compose -f docker-compose.build.yml pull
docker-compose -f docker-compose.build.yml build --parallel
docker-compose -f docker-compose.build.yml bundle
docker-compose -f docker-compose.build.yml push

docker-compose pull
docker-compose build --parallel
docker-compose bundle
docker-compose push
