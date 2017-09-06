FROM wealthwizardsengineering/ww-base-node:alpine-latest

WORKDIR /usr/src/app

COPY package.json package.json
COPY .npmrc .npmrc
ENV NODE_ENV=production
RUN npm install

# Add your source files
COPY src .

CMD npm start
