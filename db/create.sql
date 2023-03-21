DROP PROCEDURE create_store;
DROP TABLE IF EXISTS producttag;
DROP TABLE IF EXISTS productatstore;
DROP TABLE IF EXISTS storetag;
DROP TABLE IF EXISTS appuserrole;
DROP TABLE IF EXISTS pricereview;
DROP TABLE IF EXISTS tag;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS price;
DROP TABLE IF EXISTS store;
DROP TABLE IF EXISTS role;
DROP TABLE IF EXISTS appuser;


CREATE TABLE appuser (
       appuser_id SERIAL NOT NULL PRIMARY KEY,
       appuser_name VARCHAR(70) UNIQUE NOT NULL,
       appuser_password VARCHAR(70) NOT NULL,
       -- TODO: add email
       appuser_creation_date TIMESTAMP NOT NULL,
       appuser_state BOOL NOT NULL
);

CREATE TABLE role (
       role_id SERIAL NOT NULL PRIMARY KEY,
       role_name VARCHAR(70) NOT NULL
);


CREATE TABLE appuserrole (
       appuserrole_role_id int REFERENCES role (role_id) ON UPDATE CASCADE ON DELETE CASCADE,
       appuserrole_appuser_id int REFERENCES appuser (appuser_id) ON UPDATE CASCADE ON DELETE CASCADE,
       PRIMARY KEY (appuserrole_appuser_id, appuserrole_role_id)
);

CREATE TABLE store (
       store_id SERIAL NOT NULL PRIMARY KEY,
       store_name VARCHAR(172) NOT NULL,
       store_location geometry(Point,4326) NOT NULL,
       store_description TEXT NULL,
       store_schedule tstzrange NULL,
       store_creation_time timestamp NOT NULL,
       store_appuser_id int NULL REFERENCES appuser (appuser_id)
);

CREATE TABLE tag (
       tag_id SERIAL NOT NULL PRIMARY KEY,
       tag_name varchar(70) NOT NULL,
       tag_description text
);

CREATE TABLE storetag (
       storetag_store_id int NOT NULL REFERENCES store (store_id) ON UPDATE CASCADE ON DELETE CASCADE,
       storetag_tag_id int NOT NULL REFERENCES tag (tag_id) ON UPDATE CASCADE ON DELETE CASCADE,
       PRIMARY KEY (storetag_store_id,storetag_tag_id)
);


CREATE TABLE product (
       product_id SERIAL NOT NULL PRIMARY KEY,
       product_name VARCHAR(70) NOT NULL,
       product_description TEXT
);

CREATE TABLE producttag (
       producttag_product_id int NOT NULL REFERENCES product (product_id) ON UPDATE CASCADE ON DELETE CASCADE,
       producttag_tag_id int NOT NULL REFERENCES tag (tag_id) ON UPDATE CASCADE ON DELETE CASCADE,
       PRIMARY KEY (producttag_product_id,producttag_tag_id)
);

CREATE TABLE price (
       price_id SERIAL NOT NULL PRIMARY KEY,
       price_value NUMERIC(10,10) NOT NULL,
       price_timestamp timestamp NOT NULL,
       price_appuser_id int NULL REFERENCES appuser (appuser_id) ON UPDATE CASCADE
);

CREATE TABLE pricereview (
       pricereview_id SERIAL NOT NULL PRIMARY KEY,
       pricereview_score INT NOT NULL,
       pricereview_creation_timestamp timestamp NOT NULL,
       pricereview_modification_timestamp timestamp NOT NULL,
       pricereview_comment TEXT,
       preicereivew_appuser_id int NOT NULL REFERENCES appuser (appuser_id) ON UPDATE CASCADE
);




CREATE TABLE productatstore (
       productatstore_id SERIAL NOT NULL PRIMARY KEY,
       productatstore_availability int NULL,
       productatstore_store_id int NOT NULL REFERENCES store (store_id) ON UPDATE CASCADE ON DELETE CASCADE,
       productatstore_product_id int NOT NULL REFERENCES product (product_id) ON UPDATE CASCADE ON DELETE CASCADE,
       productatstore_price_id int NOT NULL REFERENCES price (price_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE store ADD COLUMN store_temp_id INT NOT NULL;
ALTER TABLE tag ADD COLUMN tag_temp_id INT NOT NULL;

INSERT INTO store (store_temp_id, store_name, store_location, store_creation_time)
       SELECT store_staging_id, COALESCE(store_staging_name,'store name missing'), ST_TRANSFORM(store_staging_geom, 4326), NOW()
       FROM store_staging;

INSERT INTO tag (tag_temp_id, tag_name)
       SELECT tag_staging_id, tag_staging_name
       FROM tag_staging;

INSERT INTO storetag (storetag_store_id, storetag_tag_id)
       SELECT store_id, tag_id
       FROM store
       LEFT JOIN storetag_staging
       ON storetag_staging_store_id = store_temp_id
       LEFT JOIN tag
       ON storetag_staging_tag_id = tag_temp_id;

ALTER TABLE store DROP COLUMN store_temp_id;
ALTER TABLE tag DROP COLUMN tag_temp_id;

CREATE PROCEDURE create_store(
       n varchar(172),
       lon double precision,
       lat double precision,
       user_id int = NULL,
       description text = NULL,
       schedule tstzrange = NULL
       )
LANGUAGE SQL
BEGIN ATOMIC
      INSERT INTO store (store_name,store_location,store_appuser_id,store_description,store_schedule,store_creation_time)
      VALUES (n,ST_Point(lon,lat,4326),user_id,description,schedule,NOW());
END

-- -- Example query
-- SELECT store_name, tag_name
-- FROM store
-- LEFT JOIN storetag
-- ON storetag_store_id = store_id
-- LEFT JOIN tag
-- ON storetag_tag_id = tag_id;
