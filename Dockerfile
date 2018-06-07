FROM node:8

# Create directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install dependencies
COPY package.json /usr/src/app
COPY yarn.lock /usr/src/app
RUN yarn install

# COPY Files
COPY . /usr/src/app

# Build
ENV DOCKER=docker
RUN yarn build
RUN apt-get update && apt-get install -y p7zip p7zip-full zip
#RUN yarn global add 7zip

# Run
ENV NODE_ENV production
EXPOSE 3000
RUN chmod +x ./build/server
CMD [ "node", "./build/server" ]
