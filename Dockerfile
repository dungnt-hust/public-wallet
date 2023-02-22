FROM node:16.13-alpine3.12

WORKDIR /home/node/app
ADD . .

ENV NODE_ENV=production
# Only copy the package.json file to work directory
COPY package*.json ./
# Install all Packages
RUN npm install
# Copy all other source code to work directory
ADD . /usr/src/app
# Start
CMD [ "npm", "start" ]

EXPOSE 9999