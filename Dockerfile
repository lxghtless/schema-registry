FROM node:12

WORKDIR /opt/lxghtless/schema-registry

COPY yarn.lock package.json ./
RUN yarn

COPY . .
RUN yarn build
RUN yarn migrate

EXPOSE 8081

CMD ["node", "dist/server.js"]