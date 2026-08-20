FROM node:16-slim AS build

WORKDIR /usr/src/app

# node:16-slim is Debian buster (EOL). Its apt repos moved to archive.debian.org.
RUN sed -i 's|deb.debian.org|archive.debian.org|g' /etc/apt/sources.list \
    && echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid-until \
    && apt-get update \
    && apt-get install -y git
RUN rm -rf /var/cache/apt/archives

# Client env values baked at build time by webpack.EnvironmentPlugin.
ARG GOOGLE_CLIENT_ID=
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID

COPY ./package.json ./yarn.lock ./
COPY ./config ./config
COPY ./static ./static
COPY ./src ./src
COPY ./tsconfig.json ./webpack.config.js ./.babelrc ./
COPY ./favicon.ico ./

RUN yarn install --no-progress --pure-lockfile --prefer-offline
RUN yarn build

FROM node:16-slim

WORKDIR /usr/src/app

# node:16-slim is Debian buster (EOL). Its apt repos moved to archive.debian.org.
RUN sed -i 's|deb.debian.org|archive.debian.org|g' /etc/apt/sources.list \
    && echo 'Acquire::Check-Valid-Until "false";' > /etc/apt/apt.conf.d/99no-check-valid-until \
    && apt-get update \
    && apt-get install -y p7zip p7zip-full zip
RUN rm -rf /var/cache/apt/archives

# Runtime env (read at runtime by the server, except GOOGLE_CLIENT_ID
# which was baked into the client bundle in the build stage).
ENV NODE_ENV=production

COPY ./favicon.ico /usr/src/app/favicon.ico
COPY ./static/images /usr/src/app/static/images
COPY ./static/styles /usr/src/app/static/styles
COPY --from=build /usr/src/app/build /usr/src/app/build
COPY --from=build /usr/src/app/node_modules /usr/src/app/node_modules

EXPOSE 3000
RUN chmod +x ./build/server
CMD [ "node", "./build/server" ]
