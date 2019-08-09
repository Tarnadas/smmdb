#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
echo $GOOGLE_CLIENT_ID
echo $DISCORD_TOKEN
$GOOGLE_CLIENT_ID $DISCORD_TOKEN docker-compose build
docker-compose bundle --push-images
