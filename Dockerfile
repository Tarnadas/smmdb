FROM tarnadas/smmdb-run

WORKDIR /usr/src/app
COPY ./favicon.ico /usr/src/app/favicon.ico
COPY --from=tarnadas/smmdb-build /usr/src/app/build /usr/src/app/build
COPY --from=tarnadas/smmdb-build-dep /usr/src/app/node_modules /usr/src/app/node_modules

# Run
ENV NODE_ENV production
EXPOSE 3000
RUN chmod +x ./build/server
CMD [ "node", "./build/server" ]
