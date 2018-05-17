FROM quay.io/wealthwizards/ww-base-node:alpine-6

WORKDIR /usr/src/app

COPY package.json package.json
ENV NODE_ENV=production
RUN npm install

# Add your source files
COPY src .

CMD ["npm","start"]
