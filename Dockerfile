FROM quay.io/wealthwizards/ww-base-node:alpine-16

WORKDIR /usr/src/app

COPY package.json package.json
COPY yarn.lock yarn.lock
ENV NODE_ENV=production
RUN yarn

# Add your source files
COPY src .

CMD ["npm","start"]
