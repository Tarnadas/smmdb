#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker-compose pull
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID DISCORD_TOKEN=$DISCORD_TOKEN docker-compose build --parallel
docker-compose bundle --push-images
