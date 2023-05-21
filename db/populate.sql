INSERT INTO :env.appuser (
       appuser_name,
       appuser_password,
       appuser_state,
       appuser_creation_date,
       appuser_email
)
VALUES ('Admin','secret',TRUE, NOW(), 'admin@gmail.com');



ALTER TABLE :env.store ADD COLUMN store_temp_id INT NOT NULL UNIQUE;
ALTER TABLE :env.tag ADD COLUMN tag_temp_id INT NOT NULL UNIQUE;

INSERT INTO :env.store (
       store_temp_id,
       store_name,
       store_location_21897,
       store_creation_time,
       store_appuser_id
       )
       SELECT
       store_staging_id,
       COALESCE(store_staging_name,'store name missing'),
       store_staging_geom,
       NOW(),
       (SELECT appuser_id FROM dev.appuser)
       FROM staging.store_staging;

INSERT INTO :env.tag (tag_temp_id, tag_name, tag_appuser_id)
       SELECT tag_staging_id,
              tag_staging_name,
              (SELECT appuser_id FROM dev.appuser)
       FROM staging.tag_staging;

INSERT INTO :env.storetag (storetag_store_id, storetag_tag_id, storetag_appuser_id)
       SELECT store_id,
              tag_id,
              (SELECT appuser_id FROM dev.appuser)
       FROM :env.store
       LEFT JOIN staging.storetag_staging
       ON storetag_staging_store_id = store_temp_id
       LEFT JOIN :env.tag
       ON storetag_staging_tag_id = tag_temp_id;

ALTER TABLE :env.store DROP COLUMN store_temp_id;
ALTER TABLE :env.tag DROP COLUMN tag_temp_id;
