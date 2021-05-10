FROM node:10-slim

WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y p7zip p7zip-full zip
RUN rm -rf /var/cache/apt/archives

COPY ./favicon.ico /usr/src/app/favicon.ico
COPY ./static/images /usr/src/app/static/images
COPY ./static/styles /usr/src/app/static/styles
COPY --from=tarnadas/smmdb-build /usr/src/app/build /usr/src/app/build
COPY --from=tarnadas/smmdb-build-dep /usr/src/app/node_modules /usr/src/app/node_modules

# Run
ENV NODE_ENV production
EXPOSE 3000
RUN chmod +x ./build/server
CMD [ "node", "./build/server" ]
