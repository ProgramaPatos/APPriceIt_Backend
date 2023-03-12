These are the database initialization scripts. You need osm2pgsql with lua support installed.
1. `./gen_db.sh` to download the file into the `osm` folder 
2. `osm2pgsql -d <db_name> -O flex -S osm_to_db.lua shpdir/<file.osm.*>`  to process and upload the data to the database. Change `<db_name>` and `<file.osm.*>` respectively. See `osm2pgsql` man page to add user and password if needed.
 
