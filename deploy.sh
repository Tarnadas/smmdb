#!/bin/bash
set -e
GIT_HASH=$(git rev-parse HEAD)
echo "using git hash $GIT_HASH"
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker pull tarnadas/smmdb-build &
docker pull tarnadas/smmdb-build-dep &
docker pull tarnadas/smmdb-api-build &
wait

(cd website && docker build --cache-from=tarnadas/smmdb-build -t tarnadas/smmdb-build:$GIT_HASH -f ./DockerfileBuild .) &
(cd website && docker build --cache-from=tarnadas/smmdb-build-dep -t tarnadas/smmdb-build-dep:$GIT_HASH -f ./DockerfileBuildDep .) &
docker build --cache-from=tarnadas/smmdb-api-build -t tarnadas/smmdb-api-build:$GIT_HASH -f ./api/DockerfileBuild . &
wait -n

docker push tarnadas/smmdb-build:latest &
docker push tarnadas/smmdb-build:$GIT_HASH &
docker push tarnadas/smmdb-build-dep:latest &
docker push tarnadas/smmdb-build-dep:$GIT_HASH &
docker push tarnadas/smmdb-api-build:latest &
docker push tarnadas/smmdb-api-build:$GIT_HASH &
wait -n

docker-compose pull --ignore-pull-failures
docker-compose build --parallel
docker tag tarnadas/smmdb tarnadas/smmdb:$GIT_HASH
docker tag tarnadas/smmdb-api tarnadas/smmdb-api:$GIT_HASH
docker push tarnadas/smmdb:latest
docker push tarnadas/smmdb:$GIT_HASH
docker push tarnadas/smmdb-api:latest
docker push tarnadas/smmdb-api:$GIT_HASH
