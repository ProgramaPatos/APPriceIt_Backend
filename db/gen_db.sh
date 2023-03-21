#!/usr/bin/env sh

DOWNLOAD_DIR=./osm
# If download dir doesn't exit it is created
[ ! -d $DOWNLOAD_DIR ] && mkdir $DOWNLOAD_DIR

# Time and date to append to file name
TIME=$(date -Iseconds)

FILE_PATH="$DOWNLOAD_DIR/bogota-$TIME.osm.pbf"

wget -q https://download.bbbike.org/osm/bbbike/Bogota/Bogota.osm.pbf -O "$FILE_PATH"
osm2pgsql -d "$DATABASE_NAME" -O flex -S osm_to_db.lua "$FILE_PATH"
psql -d "$DATABASE_NAME" -a -f "./create.sql"
