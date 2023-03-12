#!/usr/bin/env sh

DOWNLOAD_DIR=./shpdir
# If download dir doesn't exit it is created
[ ! -d $DOWNLOAD_DIR ] && mkdir $DOWNLOAD_DIR

# Time and date to append to shapefile name
TIME=$(date -Iseconds)

wget -q https://download.bbbike.org/osm/bbbike/Bogota/Bogota.osm.pbf -O "$DOWNLOAD_DIR/bogota-$TIME.osm.pbf"
