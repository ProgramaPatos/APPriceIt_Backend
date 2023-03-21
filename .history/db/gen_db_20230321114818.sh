<<<<<<< HEAD
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
=======
#!/usr/bin/env sh

DOWNLOAD_DIR=./osm
# If download dir doesn't exit it is created
[ ! -d $DOWNLOAD_DIR ] && mkdir $DOWNLOAD_DIR

# Time and date to append to file name
TIME=$(date +%y-%m-%d-%H-%M)

FILE_PATH="./osm/bogota-$TIME.osm.pbf"

wget -q https://download.bbbike.org/osm/bbbike/Bogota/Bogota.osm.pbf -O "$FILE_PATH"
PGPASSWORD="$DATABASE_PASS" psql -U "$DATABASE_USERNAME" -d "$DATABASE_NAME" -a -f "./create.sql"
osm2pgsql -c -d "$DATABASE_NAME" -U "$DATABASE_USERNAME" -W -H localhost -O flex -S osm_to_db.lua "$FILE_PATH"
PGPASSWORD="$DATABASE_PASS" psql -U "$DATABASE_USERNAME" -d "$DATABASE_NAME" -a -f "./populate_store_data.sql"
>>>>>>> 90c04856600e03f6f936b520f4e15ce014a4b2fd
