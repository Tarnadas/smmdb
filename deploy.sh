#!/bin/bash
set -e
GIT_HASH=$(git rev-parse HEAD)
echo "using git hash $GIT_HASH"

(
  docker pull tarnadas/smmdb-build
  docker build --cache-from=tarnadas/smmdb-build -t tarnadas/smmdb-build -f ./DockerfileBuild .
  docker push tarnadas/smmdb-build:latest
  docker tag tarnadas/smmdb-build tarnadas/smmdb-build:$GIT_HASH
  docker push tarnadas/smmdb-build:$GIT_HASH
) &

(
  docker pull tarnadas/smmdb-build-dep
  docker build --cache-from=tarnadas/smmdb-build-dep -t tarnadas/smmdb-build-dep -f ./DockerfileBuildDep .
  docker push tarnadas/smmdb-build-dep:latest
  docker tag tarnadas/smmdb-build-dep tarnadas/smmdb-build-dep:$GIT_HASH
  docker push tarnadas/smmdb-build-dep:$GIT_HASH
) &

wait

docker pull tarnadas/smmdb
docker build --cache-from=tarnadas/smmdb -t tarnadas/smmdb .
docker tag tarnadas/smmdb tarnadas/smmdb:$GIT_HASH
docker push tarnadas/smmdb:latest
docker push tarnadas/smmdb:$GIT_HASH
