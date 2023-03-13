#!/usr/bin/env sh

DOWNLOAD_DIR=./osm
# If download dir doesn't exit it is created
[ ! -d $DOWNLOAD_DIR ] && mkdir $DOWNLOAD_DIR

# Time and date to append to file name
TIME=$(date +%y-%m-%d-%H-%M)

FILE_PATH="./osm/bogota.osm.pbf"

wget -q https://download.bbbike.org/osm/bbbike/Bogota/Bogota.osm.pbf -O "./osm/bogota-$TIME.osm.pbf"
osm2pgsql -c -d "$DATABASE_NAME" -U "$DATABASE_USERNAME" -W -H localhost -O flex -S osm_to_db.lua "$FILE_PATH"
PGPASSWORD="$DATABASE_PASS" psql -U "$DATABASE_USERNAME" -d "$DATABASE_NAME" -a -f "./create.sql"
