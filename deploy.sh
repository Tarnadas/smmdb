#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker-compose pull
docker-compose build --parallel
docker-compose bundle --push-images
