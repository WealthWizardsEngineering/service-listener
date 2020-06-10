FROM quay.io/wealthwizards/ww-base-node:alpine-12

WORKDIR /usr/src/app

COPY package.json package.json
ENV NODE_ENV=production
RUN yarn

# Add your source files
COPY src .

CMD ["npm","start"]
