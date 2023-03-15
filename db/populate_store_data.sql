ALTER TABLE app.store ADD COLUMN store_temp_id INT NOT NULL;
ALTER TABLE app.tag ADD COLUMN tag_temp_id INT NOT NULL;

INSERT INTO app.store (store_temp_id, store_name, store_location, store_creation_time)
       SELECT store_staging_id, COALESCE(store_staging_name,'store name missing'), ST_TRANSFORM(store_staging_geom, 4326), NOW()
       FROM staging.store_staging;

INSERT INTO app.tag (tag_temp_id, tag_name)
       SELECT tag_staging_id, tag_staging_name
       FROM staging.tag_staging;

INSERT INTO app.storetag (storetag_store_id, storetag_tag_id)
       SELECT store_id, tag_id
       FROM app.store
       LEFT JOIN staging.storetag_staging
       ON storetag_staging_store_id = store_temp_id
       LEFT JOIN app.tag
       ON storetag_staging_tag_id = tag_temp_id;

ALTER TABLE app.store DROP COLUMN store_temp_id;
ALTER TABLE app.tag DROP COLUMN tag_temp_id;
