#!/bin/bash
set -e
GIT_HASH=$(git rev-parse HEAD)
echo "using git hash $GIT_HASH"
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker pull tarnadas/smmdb-build &
docker pull tarnadas/smmdb-build-dep &
wait

(cd website && docker build --cache-from=tarnadas/smmdb-build -f ./DockerfileBuild .) &
(cd website && docker build --cache-from=tarnadas/smmdb-build-dep -f ./DockerfileBuildDep .) &
wait -n

(
  docker push tarnadas/smmdb-build:latest
  docker tag tarnadas/smmdb-build tarnadas/smmdb-build:$GIT_HASH
  docker push tarnadas/smmdb-build:$GIT_HASH
) &

(
  docker push tarnadas/smmdb-build-dep:latest
  docker tag tarnadas/smmdb-build-dep tarnadas/smmdb-build-dep:$GIT_HASH
  docker push tarnadas/smmdb-build-dep:$GIT_HASH
) &

wait -n

docker-compose pull --ignore-pull-failures
docker-compose build --parallel
docker tag tarnadas/smmdb tarnadas/smmdb:$GIT_HASH
docker push tarnadas/smmdb:latest
docker push tarnadas/smmdb:$GIT_HASH
