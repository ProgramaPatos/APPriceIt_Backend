-- DROP SCHEMA IF EXISTS app CASCADE;
-- DROP SCHEMA IF EXISTS staging CASCADE;
-- DROP PROCEDURE IF EXISTS app.create_store;
-- DROP PROCEDURE IF EXISTS app.create_product;
-- DROP PROCEDURE IF EXISTS app.create_user;
-- DROP PROCEDURE IF EXISTS app.create_role;
-- DROP PROCEDURE IF EXISTS app.create_price;
-- DROP PROCEDURE IF EXISTS app.assign_role;
-- DROP PROCEDURE IF EXISTS app.assign_product_tag;
-- DROP PROCEDURE IF EXISTS app.create_price_review;
-- DROP PROCEDURE IF EXISTS app.assign_product_to_store;
-- DROP TABLE IF EXISTS app.producttag;
-- DROP TABLE IF EXISTS app.productatstore;
-- DROP TABLE IF EXISTS app.storetag;
-- DROP TABLE IF EXISTS app.appuserrole;
-- DROP TABLE IF EXISTS app.pricereview;
-- DROP TABLE IF EXISTS app.tag;
-- DROP TABLE IF EXISTS app.product;
-- DROP TABLE IF EXISTS app.price;
-- DROP TABLE IF EXISTS app.store;
-- DROP TABLE IF EXISTS app.role;
-- DROP TABLE IF EXISTS app.appuser;

CREATE SCHEMA :env;
CREATE SCHEMA fun;
CREATE SCHEMA util;
CREATE SCHEMA staging;


CREATE TABLE :env.appuser (
       appuser_id SERIAL NOT NULL PRIMARY KEY,
       appuser_name VARCHAR(70) UNIQUE NOT NULL,
       appuser_password VARCHAR(70) NOT NULL,
       -- TODO: add email
       appuser_creation_date TIMESTAMP NOT NULL,
       appuser_state BOOL NOT NULL
);

CREATE TABLE :env.role (
       role_id SERIAL NOT NULL PRIMARY KEY,
       role_name VARCHAR(70) NOT NULL
);


CREATE TABLE :env.appuserrole (
       appuserrole_role_id int REFERENCES :env.role (role_id) ON UPDATE CASCADE ON DELETE CASCADE,
       appuserrole_appuser_id int REFERENCES :env.appuser (appuser_id) ON UPDATE CASCADE ON DELETE CASCADE,
       PRIMARY KEY (appuserrole_appuser_id, appuserrole_role_id)
);

CREATE TABLE :env.store (
       store_id SERIAL NOT NULL PRIMARY KEY,
       store_name VARCHAR(172) NOT NULL,
       store_location geometry(Point,4326) NOT NULL,
       store_description TEXT NULL,
       store_schedule tstzrange NULL,
       store_creation_time timestamp NOT NULL,
       store_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id)
);

CREATE TABLE :env.tag (
       tag_id SERIAL NOT NULL PRIMARY KEY,
       tag_name varchar(70) NOT NULL,
       tag_description text,
       tag_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id)
);

CREATE TABLE :env.storetag (
       storetag_store_id int NOT NULL REFERENCES :env.store (store_id) ON UPDATE CASCADE ON DELETE CASCADE,
       storetag_tag_id int NOT NULL REFERENCES :env.tag (tag_id) ON UPDATE CASCADE ON DELETE CASCADE,
       storetag_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id),
       PRIMARY KEY (storetag_store_id,storetag_tag_id)
);


CREATE TABLE :env.product (
       product_id SERIAL NOT NULL PRIMARY KEY,
       product_name VARCHAR(70) NOT NULL,
       product_description TEXT,
       product_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id)
);


CREATE TABLE :env.price (
       price_id SERIAL NOT NULL PRIMARY KEY,
       price_value NUMERIC(10,2) NOT NULL,
       price_timestamp timestamp NOT NULL,
       price_appuser_id int NULL REFERENCES :env.appuser (appuser_id) ON UPDATE CASCADE
);

CREATE TABLE :env.pricereview (
       pricereview_id SERIAL NOT NULL PRIMARY KEY,
       pricereview_score INT NOT NULL,
       pricereview_creation_timestamp timestamp NOT NULL,
       pricereview_modification_timestamp timestamp NOT NULL,
       pricereview_comment TEXT,
       pricereview_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id) ON UPDATE CASCADE,
       pricereview_price_id int NOT NULL REFERENCES :env.price (price_id) ON UPDATE CASCADE
);




CREATE TABLE :env.productatstore (
       productatstore_id SERIAL NOT NULL PRIMARY KEY,
       productatstore_availability int NULL,
       -- TODO:Check data type for availability
       productatstore_store_id int NOT NULL REFERENCES :env.store (store_id) ON UPDATE CASCADE ON DELETE CASCADE,
       productatstore_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id) ON UPDATE CASCADE,
       productatstore_product_id int NOT NULL REFERENCES :env.product (product_id) ON UPDATE CASCADE ON DELETE CASCADE,
       productatstore_price_id int NOT NULL REFERENCES :env.price (price_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE :env.producttag (
       producttag_product_id int NOT NULL REFERENCES :env.product (product_id) ON UPDATE CASCADE ON DELETE CASCADE,
       producttag_tag_id int NOT NULL REFERENCES :env.tag (tag_id) ON UPDATE CASCADE ON DELETE CASCADE,
       producttag_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id),
       PRIMARY KEY (producttag_product_id,producttag_tag_id)
);

-- UTILITY FUNCTIONS

CREATE OR REPLACE FUNCTION util.AsGeoJSONFeatures(
       geom geometry(Point,4326)
)
RETURNS jsonb AS
$$
BEGIN
RETURN jsonb_build_object(
'type', 'FeatureCollection',
'features',
ARRAY[ jsonb_build_object(
       'type', 'Feature',
       'geometry', ST_AsGeoJSON(geom)::jsonb) ]);
END;
$$
SECURITY DEFINER
LANGUAGE plpgsql;


-- PRODUCT RELATED PROCEDURES AND FUNCTIONS

CREATE PROCEDURE fun.create_product(
    user_id int,
    n varchar(70),
    description text = NULL
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.product (product_appuser_id,product_name, product_description)
    VALUES (user_id, n, description);
END;

CREATE FUNCTION fun.update_product(
       user_id int,
       id int,
       n varchar,
       description text
       )
RETURNS TABLE (
        updated_id int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
      UPDATE :env.product
      SET product_description = description,
          product_name = n
      WHERE product_id = id
      AND product_appuser_id = user_id
      RETURNING product_id;
END;



-- STORE RELATED PROCEDURES AND FUNCTIONS
CREATE PROCEDURE fun.create_store(
       user_id int,
       n varchar(172),
       lat double precision,
       lon double precision,
       description text = NULL,
       schedule tstzrange = NULL
       )
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
      INSERT INTO :env.store (store_name,store_location,store_appuser_id,store_description,store_schedule,store_creation_time)
      VALUES (n,ST_Point(lon,lat,4326),user_id,description,schedule,NOW());
END;

CREATE FUNCTION fun.get_store(
       id int
       )
RETURNS TABLE (
        store_appuser_id int,
        store_id int,
        store_name varchar,
        store_location jsonb,
        store_description text,
        store_schedule tstzrange,
        store_creation_time timestamp
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    SELECT
    store_appuser_id,
    store_id,
    store_name,
    ST_AsGeoJSON(store_location)::jsonb,
    store_description,
    store_schedule,
    store_creation_time
    FROM :env.store WHERE store_id = id;
END;


CREATE FUNCTION fun.get_stores_within_distance(
       lat double precision,
       lon double precision,
       dist double precision
       )
RETURNS TABLE (
        store_id int,
        store_name varchar,
        store_location jsonb,
        store_description text,
        store_schedule tstzrange,
        store_creation_time timestamp,
        store_appuser_id int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    SELECT
    store_id,
    store_name,
    ST_AsGeoJSON(store_location)::jsonb,
    store_description,
    store_schedule,
    store_creation_time,
    store_appuser_id
    FROM :env.store WHERE ST_DistanceSphere(ST_Point(lon,lat,4326),store_location) < dist;
END;

CREATE OR REPLACE FUNCTION fun.get_stores_within_distance_and_name(
       lat double precision,
       lon double precision,
       dist double precision,
       name_prefix varchar
)
RETURNS TABLE (
        store_id int,
        store_name varchar,
        store_location jsonb,
        store_description text,
        store_schedule tstzrange,
        store_creation_time timestamp,
        store_appuser_id int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    SELECT
    store_id,
    store_name,
    ST_AsGeoJSON(store_location)::jsonb,
    store_description,
    store_schedule,
    store_creation_time,
    store_appuser_id
    FROM :env.store
    WHERE ST_DistanceSphere(ST_Point(lon,lat,4326),store_location) < dist
    AND   store_name LIKE name_prefix || '%';
END;

CREATE OR REPLACE FUNCTION fun.update_store(
       user_id int,
       id int,
       n varchar(172),
       lat double precision,
       lon double precision,
       description text,
       schedule tstzrange
       )
RETURNS INTEGER AS
$$
    DECLARE store_creator int;
    BEGIN
    SELECT store_appuser_id INTO store_creator FROM :env.store WHERE store_id = id;
    IF NOT FOUND THEN -- Store doesn't exist
       RETURN -1;
    ELSEIF store_creator <> user_id THEN -- Store exists but user isn't creator
        RETURN -2;
    ELSE -- Store exists and user is creator so the store is updated
        UPDATE :env.store
        SET store_description = description,
            store_name = n,
            store_location = ST_POINT(lat,lon,4326),
            store_schedule = schedule
        WHERE store_id = id
        AND store_appuser_id = user_id;
        RETURN 0;
    END IF;
    END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE PROCEDURE fun.create_user(
    n varchar(70),
    pass varchar(70),
    state bool = TRUE
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.appuser (appuser_name, appuser_password, appuser_creation_date, appuser_state)
    VALUES (n, pass, NOW(), state);
END;

CREATE PROCEDURE fun.create_price(
    user_id int,
    val numeric(10,2)
)
LANGUAGE SQL
BEGIN ATOMIC
    INSERT INTO :env.price(price_value, price_timestamp, price_appuser_id)
    VALUES (val, NOW(), user_id);
END;

CREATE PROCEDURE fun.create_role(
    n varchar(70)
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.role(role_name)
    VALUES (n);
END;

CREATE PROCEDURE fun.assign_role(
    id_role int,
    user_id int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.appuserrole(appuserrole_role_id, appuserrole_appuser_id)
    VALUES (id_role, user_id);
END;

CREATE PROCEDURE fun.assign_product_tag(
    id_product int,
    id_tag int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.producttag(producttag_product_id, producttag_tag_id)
    VALUES (id_product, id_tag);
END;

CREATE PROCEDURE fun.create_price_review(
    user_id int,
    score int,
    id_price int,
    comment text = NULL
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.pricereview(pricereview_score, pricereview_creation_timestamp, pricereview_modification_timestamp,
       pricereview_comment, pricereview_appuser_id, pricereview_price_id)
    VALUES (score, NOW(), NOW(), comment, user_id, id_price);
END;

CREATE PROCEDURE fun.assign_product_to_store(
    availability int,
    id_product int,
    id_store int,
    id_price int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.productatstore(productatstore_availability, productatstore_product_id, productatstore_store_id, productatstore_price_id)
    VALUES (availability, id_product, id_store, id_price);
END;
-- -- Example query
-- SELECT store_name, tag_name
-- FROM store
-- LEFT JOIN storetag
-- ON storetag_store_id = store_id
-- LEFT JOIN tag
-- ON storetag_tag_id = tag_id;

