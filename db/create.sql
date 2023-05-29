CREATE SCHEMA :env;
CREATE SCHEMA fun;
CREATE SCHEMA util;
CREATE SCHEMA staging;


/*CREATE TABLE :env.role (
       role_id SERIAL NOT NULL PRIMARY KEY,
       role_name VARCHAR(70) NOT NULL
);*/

CREATE TYPE role as ENUM('User', 'Mod', 'Admin');

CREATE TABLE :env.appuser (
       appuser_id SERIAL NOT NULL PRIMARY KEY,
       appuser_name VARCHAR(70) NOT NULL,
       appuser_password VARCHAR(70) NOT NULL,
       appuser_creation_date TIMESTAMP NOT NULL,
       appuser_email VARCHAR(320) UNIQUE NOT NULL,
       appuser_state BOOL NOT NULL,
       appuser_refresh_token VARCHAR(256) NULL,
       appuser_role role DEFAULT 'User'
);
CREATE INDEX appuser_id_idx ON :env.appuser (appuser_id);
CREATE INDEX appuser_email_idx ON :env.appuser (appuser_email);

/*
CREATE TABLE :env.appuserrole (
       appuserrole_role_id int REFERENCES :env.role (role_id) ON UPDATE CASCADE ON DELETE CASCADE,
       appuserrole_appuser_id int REFERENCES :env.appuser (appuser_id) ON UPDATE CASCADE ON DELETE CASCADE,
       PRIMARY KEY (appuserrole_appuser_id, appuserrole_role_id)
);*/

CREATE TABLE :env.store (
       store_id SERIAL NOT NULL PRIMARY KEY,
       store_name VARCHAR(172) NOT NULL,
       store_location_21897 geometry(Point,21897) NOT NULL, -- SRID Colombia
       store_location_4326 geometry(Point,4326) GENERATED ALWAYS AS (ST_Transform(store_location_21897,4326)) STORED,
       store_description TEXT NULL,
       store_schedule tstzrange NULL,
       store_creation_time timestamp NOT NULL,
       store_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id)
);
CREATE INDEX store_location_idx ON :env.store USING GIST ( store_location_21897 );
ALTER TABLE :env.store ALTER COLUMN store_creation_time SET DEFAULT NOW();
CREATE INDEX store_id_idx ON :env.store (store_id);
CREATE INDEX store_name_idx ON :env.store (store_name);

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
ALTER TABLE :env.product ALTER COLUMN product_creation_time SET DEFAULT NOW();

CREATE INDEX product_id_idx ON :env.product(product_id);
CREATE INDEX product_name_idx ON :env.product(product_name);

CREATE TABLE :env.productatstore (
       productatstore_id SERIAL NOT NULL PRIMARY KEY,
       productatstore_availability int NULL,
       -- TODO:Check data type for availability
       productatstore_store_id int NOT NULL REFERENCES :env.store (store_id) ON UPDATE CASCADE ON DELETE CASCADE,
       productatstore_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id) ON UPDATE CASCADE,
       productatstore_product_id int NOT NULL REFERENCES :env.product (product_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE INDEX productatstore_appuser_id_idx ON :env.productatstore (productatstore_appuser_id);
CREATE INDEX productatstore_store_product_idx ON :env.productatstore (productatstore_store_id,productatstore_product_id);
CREATE INDEX productatstore_product_store_idx ON :env.productatstore (productatstore_product_id,productatstore_store_id);



CREATE TABLE :env.price (
       price_id SERIAL NOT NULL PRIMARY KEY,
       price_value NUMERIC(10,2) NOT NULL,
       price_creation_time timestamp NOT NULL,
       price_appuser_id INT NOT NULL REFERENCES :env.appuser (appuser_id) ON UPDATE CASCADE,
       price_productatstore_id INT NOT NULL REFERENCES :env.productatstore (productatstore_id) ON UPDATE CASCADE ON DELETE CASCADE
);
ALTER TABLE :env.price ALTER COLUMN price_creation_time SET DEFAULT NOW();

CREATE TABLE :env.pricereview (
       pricereview_id SERIAL NOT NULL PRIMARY KEY,
       pricereview_score INT NOT NULL,
       pricereview_creation_time timestamp NOT NULL,
       pricereview_modification_time timestamp NOT NULL,
       pricereview_comment TEXT,
       pricereview_appuser_id int NOT NULL REFERENCES :env.appuser (appuser_id) ON UPDATE CASCADE,
       pricereview_price_id int NOT NULL REFERENCES :env.price (price_id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE :env.pricereview ALTER COLUMN pricereview_creation_time SET DEFAULT NOW();


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

CREATE OR REPLACE FUNCTION fun.create_product(
    user_id int,
    n varchar(70),
    description text = NULL
)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    INSERT INTO :env.product (product_appuser_id,product_name, product_description, product_creation_time)
    VALUES (user_id, n, description, NOW())
    RETURNING product_id;
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
        RETURN id;
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
CREATE OR REPLACE FUNCTION fun.create_store(
       user_id int,
       n varchar(172),
       lat double precision,
       lon double precision,
       description text = NULL,
       schedule tstzrange = NULL
       )
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
      INSERT INTO :env.store (store_name,store_location_21897,store_appuser_id,store_description,store_schedule,store_creation_time)
      VALUES (n,ST_Transform(ST_Point(lon,lat,4326),21897),user_id,description,schedule,NOW())
      RETURNING store_id;
END;

CREATE OR REPLACE FUNCTION fun.get_store(
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
    ST_AsGeoJSON(store_location_4326)::jsonb,
    store_description,
    store_schedule,
    store_creation_time,
    -1 as store_distance
    FROM :env.store WHERE store_id = id;
END;


CREATE OR REPLACE FUNCTION fun.stores_within_distance(
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
    ST_AsGeoJSON(store_location_4326)::jsonb,
    store_description,
    store_schedule,
    store_creation_time,
    store_appuser_id,
    ST_Distance(ST_Transform(ST_Point(lon,lat,4326),21897),store_location_21897) as store_distance
    FROM :env.store
    WHERE ST_DWithin(ST_Transform(ST_Point(lon,lat,4326),21897),store_location_21897,dist);
END;


CREATE OR REPLACE FUNCTION fun.stores_with_product_within_distance(
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
        store_id,
        store_name,
        ST_AsGeoJSON(store_location_4326)::jsonb,
        store_description,
        store_schedule,
        store_creation_time,
        store_appuser_id,
        ST_Distance(ST_Transform(ST_Point(lon,lat,4326),21897),store_location_21897) as store_distance,
        ARRAY[to_jsonb(p.*)] as store_products
      FROM :env.product p
      INNER JOIN :env.productatstore pats ON productatstore_product_id = product_id
      INNER JOIN :env.store ON productatstore_store_id = store_id
      WHERE ST_DWithin(ST_Transform(ST_Point(lon,lat,4326),21897),store_location_21897,radius)
      AND product_id = prod_id;
END;


CREATE OR REPLACE FUNCTION fun.store_products(
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
       description text
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
            store_name = n
        WHERE store_id = id
        AND store_appuser_id = user_id;
        RETURN id;
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
    INSERT INTO :env.appuser (appuser_name, appuser_password, appuser_email, appuser_refresh_token, appuser_creation_date, appuser_state, appuser_role)
    VALUES (n, pass, email, refresh_token, NOW(), state, 'User');
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

/*CREATE OR REPLACE PROCEDURE fun.create_role(
    n role
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    ALTER TYPE role ADD VALUE 'prueba';
END;*/

CREATE OR REPLACE PROCEDURE fun.assign_role(
    role_name role,
    user_id int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    UPDATE :env.appuser
    SET appuser_role = role_name
    WHERE appuser_id = user_id;
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
    INSERT INTO :env.pricereview(pricereview_score, pricereview_creation_time, pricereview_modification_time,
       pricereview_comment, pricereview_appuser_id, pricereview_price_id)
    VALUES (score, NOW(), NOW(), comment, user_id, id_price);
END;

CREATE OR REPLACE PROCEDURE fun.assign_product_to_store(
    user_id INT,
    id_product INT,
    id_store INT,
    availability INT = 0
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

CREATE OR REPLACE FUNCTION fun.get_user(
       email varchar(320)
       )
RETURNS TABLE (
        appuser_id int,
        appuser_name varchar,
        appuser_password varchar,
        appuser_creation_date timestamp,
        appuser_email varchar,
        appuser_state bool,
        appuser_refresh_token varchar, 
        appuser_role role
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
    appuser_refresh_token varchar,
    appuser_role role
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

CREATE OR REPLACE PROCEDURE fun.update_user_name(
       id INT,
       username varchar(70)
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    UPDATE :env.appuser
    SET appuser_name = username
    WHERE appuser_id = id;
END;

CREATE OR REPLACE PROCEDURE fun.update_user_password(
       id INT,
       pass varchar(70)
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    UPDATE :env.appuser
    SET appuser_password = pass
    WHERE appuser_id = id;
END;

CREATE OR REPLACE PROCEDURE fun.delete_product(
    id int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    /*DELETE FROM producttag WHERE producttag_product_id = id;
    DELETE FROM pricereview WHERE pricereview_price_id IN 
    (SELECT price_id FROM price WHERE price_productatstore_id IN 
    (SELECT productatstore_id FROM productatstore WHERE productatstore_product_id = id)) ;
    DELETE FROM price WHERE price_productatstore_id IN 
    (SELECT productatstore_id FROM productatstore WHERE productatstore_product_id = id);
    DELETE FROM productatstore WHERE productatstore_product_id = id;*/
    DELETE FROM :env.product WHERE product_id = id; 
END;

CREATE OR REPLACE FUNCTION fun.update_user_state(
       id INT,
       st boolean
)
RETURNS INTEGER AS
$$
    DECLARE user int;
    BEGIN
    SELECT appuser_id INTO user FROM dev.appuser WHERE appuser_id = id;
    IF NOT FOUND THEN --user doesn't exist
        RETURN -1;
    ELSE
        UPDATE dev.appuser
        SET appuser_state = st
        WHERE appuser_id = id;
        RETURN 0;
    END IF;
    END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;


CREATE OR REPLACE FUNCTION fun.delete_store(
    id int,
    user_id int
)
RETURNS INTEGER AS
$$
    DECLARE store_creator int;
    DECLARE appuser_current_role role;
    BEGIN
    SELECT store_appuser_id INTO store_creator FROM dev.store WHERE store_id = id;
    SELECT appuser_role INTO appuser_current_role FROM dev.appuser WHERE appuser_id = user_id;
    IF NOT FOUND THEN -- Store doesn't exist
       RETURN -1;
    ELSEIF store_creator <> user_id AND appuser_current_role <> 'Admin' THEN -- Store exists but user isn't creator
        RETURN -2;
    ELSE -- Store exists and user is creator so the store is deleted
        DELETE FROM dev.store WHERE store_id = id;
        RETURN 0;
    END IF;
    END;
$$
LANGUAGE plpgsql
SECURITY DEFINER;

CREATE OR REPLACE FUNCTION fun.update_price(
    user_id int,
    id_product INT,
    id_store INT,
    val numeric(10,2)
)
RETURNS INT AS
$$
DECLARE
    productatstore_found_id int;
    price_found_id int;
BEGIN
    SELECT productatstore_id INTO productatstore_found_id
    FROM dev.productatstore
    WHERE productatstore_store_id = id_store
    AND productatstore_product_id = id_product;
    IF NOT FOUND THEN -- productatstore not found
       RETURN -1;
    ELSE
        SELECT price_id INTO price_found_id
        FROM dev.price
        WHERE price_productatstore_id = productatstore_found_id;
        IF NOT FOUND THEN -- not previous price info
            RETURN -2; 
        ELSE
            UPDATE dev.price
            SET price_value = val,
                price_creation_time = NOW(),
                price_appuser_id = user_id
            WHERE price_productatstore_id = productatstore_found_id;
            RETURN 0;
        END IF;
    END IF;
END;
$$
SECURITY DEFINER
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fun.delete_price(
    user_id int,
    id_product INT,
    id_store INT,
    id_price INT
)
RETURNS INT AS
$$
DECLARE
    productatstore_found_id int;
    price_creator_id int;
    role_current_user role;
BEGIN

    SELECT price_appuser_id INTO price_creator_id
    FROM dev.price
    WHERE price_id = id_price;
    IF NOT FOUND THEN
       RETURN -1;
    END IF;
    
    SELECT appuser_role INTO role_current_user
    FROM dev.appuser
    WHERE appuser_id = user_id;

    SELECT productatstore_id INTO productatstore_found_id
    FROM dev.productatstore
    WHERE productatstore_store_id = id_store
    AND productatstore_product_id = id_product;
    IF NOT FOUND THEN
       RETURN -1;
    ELSEIF price_creator_id <> user_id AND role_current_user = 'User' THEN
        RETURN -2;
    ELSE
        DELETE FROM dev.price
        WHERE price_id = id_price;
        RETURN 0;
    END IF;
END;
$$
SECURITY DEFINER
LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fun.get_user_stores(
       id int
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
    ST_AsGeoJSON(store_location_4326)::jsonb,
    store_description,
    store_schedule,
    store_creation_time,
    store_appuser_id
    FROM :env.store
    WHERE store_appuser_id = id;
END;

CREATE OR REPLACE FUNCTION fun.get_user_products(
       id int
       )
RETURNS TABLE (
       product_id int, 
       product_name varchar,
       product_description text,
       product_creation_time timestamp,
       product_appuser_id int

)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    SELECT
    product_id, 
    product_name,
    product_description,
    product_creation_time,
    product_appuser_id
    FROM :env.product
    WHERE product_appuser_id = id;
END;

CREATE OR REPLACE FUNCTION fun.get_user_prices(
       id int
       )
RETURNS TABLE (
       price_id int, 
       price_value numeric,
       price_creation_time timestamp,
       price_appuser_id int,
       price_productatstore_id int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    SELECT
    price_id, 
    price_value,
    price_creation_time,
    price_appuser_id,
    price_productatstore_id
    FROM :env.price
    WHERE price_appuser_id = id;
END;

CREATE OR REPLACE FUNCTION fun.get_user_productsatstore(
       id int
       )
RETURNS TABLE (
       productatstore_id int, 
       productatstore_availability int,
       productatstore_store_id int,
       productatstore_appuser_id int,
       productatstore_product_id int
)
LANGUAGE SQL
SECURITY DEFINER
BEGIN ATOMIC
    SELECT
    productatstore_id, 
    productatstore_availability,
    productatstore_store_id,
    productatstore_appuser_id,
    productatstore_product_id
    FROM :env.productatstore
    WHERE productatstore_appuser_id = id;
END;

