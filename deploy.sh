#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID DISCORD_TOKEN=$DISCORD_TOKEN docker-compose build
docker-compose bundle --push-images
