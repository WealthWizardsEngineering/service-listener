FROM risingstack/alpine:3.3-v6.2.0-3.6.0

WORKDIR /usr/src/app

COPY package.json package.json
COPY .npmrc .npmrc
ENV NODE_ENV=production
RUN npm install

# Add your source files
COPY src .

CMD npm start
