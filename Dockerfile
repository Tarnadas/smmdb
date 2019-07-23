FROM mhart/alpine-node:10 as build

# Create directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
RUN apk add git

# Install dependencies
COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app
RUN yarn install

# COPY Files
COPY . /usr/src/app

# Build
ENV DOCKER=docker
RUN yarn build:dev

FROM node:10-slim as dep-build

WORKDIR /usr/src/app
RUN apt-get update && apt-get install -y git
COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app
RUN yarn install --prod

FROM node:10-slim

WORKDIR /usr/src/app
COPY ./favicon.ico /usr/src/app/favicon.ico
COPY --from=build /usr/src/app/build /usr/src/app/build
COPY --from=dep-build /usr/src/app/node_modules /usr/src/app/node_modules
RUN apt-get update && apt-get install -y p7zip p7zip-full zip
RUN rm -rf /var/cache/apt/archives

# Run
ENV NODE_ENV development
# ENV NODE_ENV production
EXPOSE 3000
RUN chmod +x ./build/server
CMD [ "node", "./build/server" ]
