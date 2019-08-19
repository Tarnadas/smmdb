FROM node:10-slim

WORKDIR /usr/src/app
COPY ./favicon.ico /usr/src/app/favicon.ico
COPY --from=tarnadas/smmdb-build /usr/src/app/build /usr/src/app/build
COPY --from=tarnadas/smdb-build-dep /usr/src/app/node_modules /usr/src/app/node_modules
RUN apt-get update && apt-get install -y p7zip p7zip-full zip
RUN rm -rf /var/cache/apt/archives

# Run
ENV NODE_ENV production
EXPOSE 3000
RUN chmod +x ./build/server
CMD [ "node", "./build/server" ]
