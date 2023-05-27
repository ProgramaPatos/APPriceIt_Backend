FROM node:18.15-alpine3.17 as node_prebuild
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:18.15-alpine3.17 as production
WORKDIR /app

COPY --from=node_prebuild /app ./
COPY . .
RUN npm install && npm run build

# ENTRYPOINT [ "sh" ]
CMD ["npm","run","start:prod"]
