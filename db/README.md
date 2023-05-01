Use the `db.sh` script to manage the db, default variables should be in specified in the `../.env` file, you should explicitly pass the arguments for the admin user and password, e.g. `./db.sh --admin=postgres --password=example --command=create`.

To download the osm file do something like `wget -q https://download.bbbike.org/osm/bbbike/Bogota/Bogota.osm.pbf"`
