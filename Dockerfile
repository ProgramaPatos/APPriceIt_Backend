# for use in multiple stages dont overwrite
ARG OSM2PGSQL_RUNTIME_DEPENDENCIES="libgcc  libstdc++  boost-filesystem  expat  libbz2  postgresql-libs  libpq  proj-dev  lua5.3  lua5.3-libs"

FROM alpine:3.17 as build_osm2pgsql

ENV OSM2PGSQL_VERSION 1.8.1
ARG OSM2PGSQL_RUNTIME_DEPENDENCIES

RUN apk add --no-cache ${OSM2PGSQL_RUNTIME_DEPENDENCIES}

# Install develop tools and dependencies, build osm2pgsql and remove develop tools and dependencies
RUN apk add --no-cache \
    make \
    cmake \
    g++ \
    git \
    expat-dev \
    boost-dev \
    bzip2-dev \
    zlib-dev \
    lua5.3-dev \
    postgresql-dev

WORKDIR /src
RUN git clone --depth=1 https://github.com/openstreetmap/osm2pgsql.git

WORKDIR osm2pgsql/build

RUN cmake .. -DCMAKE_BUILD_TYPE=Release

RUN make &&\
    make install

ENTRYPOINT ["sh"]

FROM node:18.15-alpine3.17 as node_prebuild
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM node:18.15-alpine3.17 as development
ARG OSM2PGSQL_RUNTIME_DEPENDENCIES
RUN apk add --no-cache bash postgresql-client ${OSM2PGSQL_RUNTIME_DEPENDENCIES}
RUN mkdir /usr/local/share/osm2pgsql
COPY --from=build_osm2pgsql /src/osm2pgsql/build/osm2pgsql /src/osm2pgsql/empty.style /src/osm2pgsql/default.style /tmp/

RUN mv /tmp/osm2pgsql /usr/local/bin/
WORKDIR /app

COPY --from=node_prebuild /app ./
COPY . .
RUN npm install && npm run build

# ENTRYPOINT [ "sh" ]
CMD ["npm","run","start:dev"]

FROM postgis/postgis:15-3.3-alpine as database

# ARG OSM2PGSQL_RUNTIME_DEPENDENCIES
# RUN apk add --no-cache ${OSM2PGSQL_RUNTIME_DEPENDENCIES}
# RUN mkdir /usr/local/share/osm2pgsql
# COPY --from=build_osm2pgsql /src/osm2pgsql/build/osm2pgsql /src/osm2pgsql/empty.style /src/osm2pgsql/default.style /tmp/

# RUN mv /tmp/osm2pgsql /usr/local/bin/

# mv /tmp/empty.style /tmp/default.style
