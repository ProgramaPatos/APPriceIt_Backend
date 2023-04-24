#!/bin/bash

# So that when a command fails, bash exits instead of continuing with the rest of the script.
set -o errexit
# This will make the script fail, when accessing an unset variable.
set -o nounset
# This will ensure that a pipeline command is treated as failed, even if one command in the pipeline fails.
set -o pipefail
# Run as TRACE=1 ./this_script.sh to enable debug
if [[ "${TRACE-0}" == "1" ]]; then set -o xtrace; fi
# Change to script's directory
cd "$(dirname "$0")"

me="$(basename "$0")"

help_message="
This script creates, drops or initializes a database using Postgres. It requires a .env file in the parent directory that contains the variables DB_NAME, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and ENV.

Usage: ./$me [OPTIONS]

Options:
  -d, --database=NAME          Set the database name.
  -a, --admin=NAME             Set the Postgres admin user name. Default is 'postgres'.
  -p, --password=PASSWORD      Set the Postgres admin user password. Default is 'mypassword'.
  -h, --host=HOST              Set the database host.
  -P, --port=PORT              Set the database port.
  -c, --command=COMMAND        Set the command to run: create, drop or initialize. Default is 'create'.
  -f, --osm-file=FILE          Set the path to the OSM file to import.
  -t, --type=ENV               Set the environment type: dev or prod. Default is 'dev'.
  -n, --app-user=USER          Set the application user name. Default is the value of DB_USER in the .env file.
  -w, --app-password=PASSWORD  Set the application user password. Default is the value of DB_PASSWORD in the .env file.

Commands:
  create                     Create the database and initialize the schema.
  drop                       Drop the database. Only available in dev environment.
  load                     Load the osm file into the database staging schema
  populate                   Process staging data from staging and populate tables
  create_user                Creates user app-user with password app-password for use with limited priviledges from a web server
  drop_user                  Deletes app-user

Variables from .env:
  DB_NAME                    The name of the database.
  DB_HOST                    The hostname of the database server.
  DB_PORT                    The port number to connect to the database.
  DB_USER                    The name of the database user.
  DB_PASSWORD                The password of the database user.
  ENV                        The environment either 'prod' or 'dev'

Examples:
  # Create the database with variables from .env
  ./$me -a postgres -p example -c create

  # Drop the database with explicit variables
  ./$me -h localhost -p 5432  -d dbname -a postgres -p example -c drop

  # Load data from osm file
  ./$me -a postgres -p example -c load -f path/to/osm/file

  # Create user using .env vars
  ./$me -a postgres -p example -c create_user
"

# Function to read a variable from the .env file or add it to the missing_values array
read_env_var() {
    local varname=$1
    local value
    value=$(grep -m 1 -E "^${varname}=" ../.env | cut -d'=' -f2)

    if [[ -z "$value" ]]; then
        missing_values+=("${varname}")
    else
        echo "${value}"
    fi
}

DATABASE=$(read_env_var "DB_NAME")
ADMIN="postgres"
ADMIN_PASSWORD="mypassword"
HOST=$(read_env_var "DB_HOST")
PORT=$(read_env_var "DB_PORT")
COMMAND=""
OSM_FILE=""
TYPE=$(read_env_var "ENV")
APP_USER=$(read_env_var "DB_USER")
APP_PASSWORD=$(read_env_var "DB_PASSWORD")

# Define the options and long options using getopt
OPTIONS=d:a:p:h:P:c:f:t:n:w:
LONGOPTS=database:,admin:,password:,host:,port:,command:,osm-file:,type:,app-user:,app-password:

# Parse the options and long options using getopt
PARSED=$(getopt --options=$OPTIONS --longoptions=$LONGOPTS --name "$0" -- "$@")
if [[ $? -ne 0 ]]; then
    exit 1
fi

# Evaluate the parsed options and set the variables
eval set -- "$PARSED"
while true; do
    case "$1" in
        -d | --database)
            DATABASE="$2"
            shift 2
            ;;
        -a | --admin)
            ADMIN="$2"
            shift 2
            ;;
        -p | --password)
            ADMIN_PASSWORD="$2"
            shift 2
            ;;
        -h | --host)
            HOST="$2"
            shift 2
            ;;
        -P | --port)
            PORT="$2"
            shift 2
            ;;
        -c | --command)
            COMMAND="$2"
            shift 2
            ;;
        -f | --osm-file)
            OSM_FILE="$2"
            shift 2
            ;;
        -t | --type)
            TYPE="$2"
            if [[ "$TYPE" != "dev" && "$TYPE" != "prod" ]]; then
                failt "Error: input must be either 'dev' or 'prod'"
            fi
            shift 2
            ;;
        -n | --app-user)
            APP_USER="$2"
            shift 2
            ;;
        -w | --app-password)
            APP_PASSWORD="$2"
            shift 2
            ;;
        --)
            shift
            break
            ;;
        *)
            echo "ERROR: Invalid argument" >&2
            exit 1
            ;;
    esac
done

CONNECTION_STRING_WITHOUT_DATABASE="host=$HOST port=$PORT user=$ADMIN password=$ADMIN_PASSWORD"
CONNECTION_STRING="$CONNECTION_STRING_WITHOUT_DATABASE dbname=$DATABASE"

echo "Using connection strings: ${CONNECTION_STRING}"
echo "Using connection strings: ${CONNECTION_STRING_WITHOUT_DATABASE}"
psqldo() {
    psql "$CONNECTION_STRING" "$@"
}

psqlnpdo() {
    psql "$CONNECTION_STRING_WITHOUT_DATABASE" "$@"
}

logt() {
    TIMESTAMP=$(date +"%Y-%m-%d %T")
    echo -n "[$TIMESTAMP] (\"$CONNECTION_STRING\") $1"
}

failt() {
    TIMESTAMP=$(date +"%Y-%m-%d %T")
    echo -n "[$TIMESTAMP] ERROR: (\"$CONNECTION_STRING\") $1" >&2
    exit 1
}
# Function to check if a database exists
# Usage: db_exists DB_NAME
function db_exists {
    local db_name=$1
    local result
    result=$(psqlnpdo -lqt | cut -d \| -f 1 | grep -w "$db_name" | tr -d ' ')
    if [ "$result" = "$db_name" ]; then
        return 0 # database exists, return true
    else
        return 1 # database does not exist, return false
    fi
}

case $COMMAND in
    create)
        # Check if the database already exists
        if db_exists "$DATABASE"; then
            logt "Database already exists"
            # Check if the schema exists
        else
            # Create the database
            logt "Database does not exists"
            logt "Creating database"
            psqlnpdo --command="CREATE DATABASE $DATABASE"
            logt "Database created"
            logt "Enabling postgis"
            psqldo --command="CREATE EXTENSION postgis"
            logt "Postgis disabled"
        fi

        psqldo \
            -f create.sql \
            --variable=env="$TYPE"

        logt "Database created and schema initialized"
        ;;
    drop)
        if [ "$TYPE" != "dev" ]; then
            failt "Cannot drop database on a non-DEV environment \"$TYPE\""
        fi
        # Prompt for confirmation before dropping the database
        read -p "Are you sure you want to drop the database $DATABASE on host $HOST? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            logt "Dropping database"
            psqlnpdo --command="DROP DATABASE $DATABASE"
            logt "Database dropped"
        else
            logt "Database not dropped"
        fi
        ;;
    load)
        # Load data to the database
        if [[ ! -f "$OSM_FILE" ]]; then
            failt "Invalid file \"$OSM_FILE\" use -f path/to/osm/file"
        fi
        logt "Loading data from OSM file"
        osm2pgsql \
            --create \
            --output=flex \
            --database="$CONNECTION_STRING" \
            --style=osm_to_db.lua \
            "$OSM_FILE"

        logt "Data loaded to database"
        ;;
    populate)
        # Populate the database with staging data
        logt "Populatng database with staging data"
        psqldo \
            -f populate.sql \
            --variable=env="$TYPE"
        logt "Database populated with staging data"
        ;;
    create_user)
        if [[ -z "$APP_USER" || -z "$APP_PASSWORD" ]]; then
            failt "You should provide both user name and password to create a new user"
        fi
        logt "Creating new user $APP_USER"
        psqldo \
            -f user.sql \
            --variable=user="$APP_USER" \
            --variable=user_pass="$APP_PASSWORD"
        logt "Created user $APP_USER"
        # echo "DB_USER=$APP_USER" >>../.env
        # echo "DB_PASS=$APP_PASSWORD" >>../.env
        # logt "Added user $APP_USER to .env"

        ;;
    drop_user)
        if [[ -z "$APP_USER" ]]; then
            failt "You should provide user name to drop a user"
        fi
        echo "User is $APP_USER"
        logt "Dropping user $APP_USER"
        if db_exists "$DATABASE"; then
            logt "Dropping owned by $APP_USER in database"
            psqldo --command "DROP OWNED BY $APP_USER"
            logt "Owned dropped"
        fi

        logt "Dropping owned by $APP_USER outside database"
        psqlnpdo --command "DROP OWNED BY $APP_USER"
        logt "Owned dropped"
        psqlnpdo --command "DROP USER $APP_USER"
        logt "User $APP_USER dropped"
        # sed --in-place "/DB_USER=$APP_USER/d" ../.env
        # sed --in-place "/DB_PASS/d" ../.env

        ;;
    *)
        echo "$help_message"
        exit 1
        ;;
esac
