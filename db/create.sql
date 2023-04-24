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
       appuser_email VARCHAR(320) UNIQUE NOT NULL,
       appuser_state BOOL NOT NULL,
       appuser_refresh_token VARCHAR(256) NULL 
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
       product_creation_time timestamp NOT NULL,
       product_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id)
);



CREATE TABLE :env.productatstore (
       productatstore_id SERIAL NOT NULL PRIMARY KEY,
       productatstore_availability int NULL,
       -- TODO:Check data type for availability
       productatstore_store_id int NOT NULL REFERENCES :env.store (store_id) ON UPDATE CASCADE ON DELETE CASCADE,
       productatstore_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id) ON UPDATE CASCADE,
       productatstore_product_id int NOT NULL REFERENCES :env.product (product_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE :env.price (
       price_id SERIAL NOT NULL PRIMARY KEY,
       price_value NUMERIC(10,2) NOT NULL,
       price_creation_time timestamp NOT NULL,
       price_appuser_id INT NOT NULL REFERENCES :env.appuser (appuser_id) ON UPDATE CASCADE,
       price_productatstore_id INT NOT NULL REFERENCES :env.productatstore (productatstore_id) ON UPDATE CASCADE
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

CREATE OR REPLACE PROCEDURE fun.create_product(
    user_id int,
    n varchar(70),
    description text = NULL
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.product (product_appuser_id,product_name, product_description, product_creation_time)
    VALUES (user_id, n, description, NOW());
END;

CREATE OR REPLACE FUNCTION fun.get_product(
       id INT
)
RETURNS TABLE (
       product_appuser_id INT,
       product_id INT,
       product_name VARCHAR(70),
       product_description TEXT,
       product_creation_time timestamp
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
      SELECT
      product_appuser_id,
      product_id,
      product_name,
      product_description,
      product_creation_time
      FROM :env.product WHERE product_id = id;
END;

-- CREATE OR REPLACE FUNCTION fun.get_product_within_distance(
--        id int,
--        lat double precision,
--        lon double precision,
--        dist double precision
-- )
-- LANGUAGE SQL
-- SECURITY DEFINER
-- RETURNS TABLE (
--        product_appuser_id INT,
--        product_id INT,
--        product_name VARCHAR(70),
--        product_description TEXT,
--        product_creation_time timestamp,
--        product_distance double precision,
--        product_store jsonb
-- )
-- BEGIN ATOMIC
--       SELECT
--       product_appuser_id,
--       product_id,
--       product_name,
--       product_description,
--       product_creation_time,
--       product_distance,



-- END;


CREATE OR REPLACE FUNCTION fun.update_product(
       user_id int,
       id int,
       n varchar,
       description text
       )
RETURNS INT AS
$$
    DECLARE product_creator int;
    BEGIN
    SELECT product_appuser_id INTO product_creator FROM dev.product WHERE product_id = id;
    IF NOT FOUND THEN -- Store doesn't exist
       RETURN -1;
    ELSEIF product_creator <> user_id THEN -- Store exists but user isn't creator
        RETURN -2;
    ELSE -- Store exists and user is creator so the store is updated
        UPDATE dev.product
        SET product_description = description,
            product_name = n
        WHERE product_id = id
        AND product_appuser_id = user_id;
        RETURN 0;
    END IF;
    END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fun.get_product_with_name(
       n varchar
)
RETURNS TABLE (
       product_appuser_id INT,
       product_id INT,
       product_name VARCHAR(70),
       product_description TEXT,
       product_creation_time timestamp
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
      SELECT
      product_appuser_id,
      product_id,
      product_name,
      product_description,
      product_creation_time
      FROM :env.product WHERE product_name LIKE n || '%';
END;



-- STORE RELATED PROCEDURES AND FUNCTIONS
CREATE OR REPLACE PROCEDURE fun.create_store(
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
        store_creation_time timestamp,
        store_distance double precision
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
    store_creation_time,
    -1 as store_distance
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
        store_appuser_id int,
        store_distance double precision
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
    store_appuser_id,
    store_distance
    FROM (
        SELECT
        *,
        ST_DistanceSphere(ST_Point(lon,lat,4326),store_location) as store_distance
        FROM :env.store
    ) sub_dist
    WHERE sub_dist.store_distance < dist;
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
        store_appuser_id int,
        store_distance double precision
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    SELECT
    *
    FROM fun.get_stores_within_distance(lat, lon, dist)
    WHERE store_name LIKE name_prefix || '%';
END;

CREATE OR REPLACE FUNCTION fun.get_store_products(
       id int
)
RETURNS TABLE (
       product_appuser_id INT,
       product_id INT,
       product_name VARCHAR(70),
       product_description TEXT,
       product_creation_time timestamp,
       product_availability INT
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
      SELECT
      product_appuser_id,
      product_id,
      product_name,
      product_description,
      product_creation_time,
      productatstore_availability as product_availability
      FROM :env.productatstore
      INNER JOIN :env.product ON productatstore_product_id = product_id
      WHERE productatstore_store_id = id;
END;

CREATE OR REPLACE FUNCTION fun.get_stores_product_within_distance(
       prod_id INT,
       lat double precision,
       lon double precision,
       radius double precision
)
RETURNS TABLE (
        store_id int,
        store_name varchar,
        store_location jsonb,
        store_description text,
        store_schedule tstzrange,
        store_creation_time timestamp,
        store_appuser_id int,
        store_distance double precision,
        store_products jsonb[]
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
      SELECT
        s.*,ARRAY[to_jsonb(p.*)] as store_products
      FROM :env.product p
      INNER JOIN :env.productatstore pats ON productatstore_product_id = product_id
      INNER JOIN fun.get_stores_within_distance(lat,lon,radius) s ON productatstore_store_id = store_id
      WHERE product_id = prod_id
      ORDER BY store_distance DESC;
END;


CREATE OR REPLACE FUNCTION fun.get_stores_product_with_prices_within_distance(
       prod_id INT,
       lat double precision,
       lon double precision,
       radius double precision
)
RETURNS TABLE (
        store_id int,
        store_name varchar,
        store_location jsonb,
        store_description text,
        store_schedule tstzrange,
        store_creation_time timestamp,
        store_appuser_id int,
        store_distance double precision,
        store_products jsonb[]
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
      SELECT
        s.*,ARRAY[to_jsonb(p.*)] as store_products
      FROM :env.product p
      INNER JOIN :env.productatstore pats ON productatstore_product_id = product_id
      INNER JOIN fun.get_stores_within_distance(lat,lon,radius) s ON productatstore_store_id = store_id
      WHERE product_id = prod_id
      ORDER BY store_distance DESC;
END;


CREATE OR REPLACE FUNCTION fun.get_store_products_with_prices(
       id int
)
RETURNS TABLE (
       product_appuser_id INT,
       product_id INT,
       product_name VARCHAR(70),
       product_description TEXT,
       product_creation_time timestamp,
       product_availability INT,
       product_prices jsonb
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
      SELECT
      product_appuser_id,
      product_id,
      product_name,
      product_description,
      product_creation_time,
      SUM(productatstore_availability) as product_availability,
      jsonb_agg(to_jsonb(price) - 'price_productatstore_id') as prices
      FROM :env.productatstore
      INNER JOIN :env.product ON productatstore_product_id = product_id
      LEFT JOIN :env.price ON productatstore_id = price_productatstore_id
      WHERE productatstore_store_id = id
      GROUP BY product_id;
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
    SELECT store_appuser_id INTO store_creator FROM dev.store WHERE store_id = id;
    IF NOT FOUND THEN -- Store doesn't exist
       RETURN -1;
    ELSEIF store_creator <> user_id THEN -- Store exists but user isn't creator
        RETURN -2;
    ELSE -- Store exists and user is creator so the store is updated
        UPDATE dev.store
        SET store_description = description,
            store_name = n,
            store_location = ST_POINT(lon,lat,4326),
            store_schedule = schedule
        WHERE store_id = id
        AND store_appuser_id = user_id;
        RETURN 0;
    END IF;
    END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE OR REPLACE PROCEDURE fun.create_user(
    n varchar(70),
    pass varchar(70),
    email varchar(320),
    refresh_token varchar(256),
    state bool = TRUE
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.appuser (appuser_name, appuser_password, appuser_email, appuser_refresh_token, appuser_creation_date, appuser_state)
    VALUES (n, pass, email, refresh_token, NOW(), state);
END;

CREATE OR REPLACE FUNCTION fun.create_price(
    user_id int,
    id_product INT,
    id_store INT,
    val numeric(10,2)
)
RETURNS INT AS
$$
DECLARE
    productatstore_found_id int;
BEGIN
    SELECT productatstore_id INTO productatstore_found_id
    FROM dev.productatstore
    WHERE productatstore_store_id = id_store
    AND productatstore_product_id = id_product;
    IF NOT FOUND THEN
       RETURN -1;
    ELSE
        INSERT INTO dev.price
        (price_value, price_creation_time, price_appuser_id, price_productatstore_id)
        VALUES (val, NOW(), user_id,productatstore_found_id);
        RETURN 0;
    END IF;
END;
$$
SECURITY DEFINER
LANGUAGE plpgsql ;

CREATE OR REPLACE PROCEDURE fun.create_role(
    n varchar(70)
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.role(role_name)
    VALUES (n);
END;

CREATE OR REPLACE PROCEDURE fun.assign_role(
    id_role int,
    user_id int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.appuserrole(appuserrole_role_id, appuserrole_appuser_id)
    VALUES (id_role, user_id);
END;

CREATE OR REPLACE PROCEDURE fun.assign_product_tag(
    id_product int,
    id_tag int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.producttag(producttag_product_id, producttag_tag_id)
    VALUES (id_product, id_tag);
END;

CREATE OR REPLACE PROCEDURE fun.create_price_review(
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

CREATE OR REPLACE PROCEDURE fun.assign_product_to_store(
    user_id INT,
    id_product INT,
    id_store INT,
    availability INT = NULL
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.productatstore
    (productatstore_availability, productatstore_product_id, productatstore_store_id, productatstore_appuser_id)
    VALUES (availability, id_product, id_store, user_id);
END;
-- -- Example query
-- SELECT store_name, tag_name
-- FROM store
-- LEFT JOIN storetag
-- ON storetag_store_id = store_id
-- LEFT JOIN tag
-- ON storetag_tag_id = tag_id;

CREATE FUNCTION fun.get_user(
       email varchar(320)
       )
RETURNS TABLE (
        appuser_id int,
        appuser_name varchar,
        appuser_password varchar,
        appuser_creation_date timestamp,
        appuser_email varchar,
        appuser_state bool,
        appuser_refresh_token varchar
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    SELECT
    appuser_id int,
    appuser_name varchar,
    appuser_password varchar,
    appuser_creation_date timestamp,
    appuser_email varchar,
    appuser_state bool,
    appuser_refresh_token varchar
    FROM :env.appuser WHERE appuser_email = email;
END;

CREATE OR REPLACE PROCEDURE fun.update_user_refresh_token(
       id INT,
       refresh_token VARCHAR(256)
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    UPDATE :env.appuser
    SET appuser_refresh_token = refresh_token
    WHERE appuser_id = id;
END;
