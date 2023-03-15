#!/usr/bin/env sh
PGPASSWORD="$DATABASE_PASS" psql -U "$DATABASE_USERNAME" -d "$DATABASE_NAME" -a -f "./clean_db.sql"
