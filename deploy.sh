#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker-compose build --build-arg GOOGLE_CLIENT_ID --build-arg DISCORD_TOKEN --parallel
docker-compose pull
docker-compose bundle --push-images
