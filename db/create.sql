DROP SCHEMA IF EXISTS app CASCADE;
DROP SCHEMA IF EXISTS staging CASCADE;
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


CREATE SCHEMA app;
CREATE SCHEMA staging;


CREATE TABLE app.appuser (
       appuser_id SERIAL NOT NULL PRIMARY KEY,
       appuser_name VARCHAR(70) UNIQUE NOT NULL,
       appuser_password VARCHAR(70) NOT NULL,
       -- TODO: add email
       appuser_creation_date TIMESTAMP NOT NULL,
       appuser_state BOOL NOT NULL
);

CREATE TABLE app.role (
       role_id SERIAL NOT NULL PRIMARY KEY,
       role_name VARCHAR(70) NOT NULL
);


CREATE TABLE app.appuserrole (
       appuserrole_role_id int REFERENCES app.role (role_id) ON UPDATE CASCADE ON DELETE CASCADE,
       appuserrole_appuser_id int REFERENCES app.appuser (appuser_id) ON UPDATE CASCADE ON DELETE CASCADE,
       PRIMARY KEY (appuserrole_appuser_id, appuserrole_role_id)
);

CREATE TABLE app.store (
       store_id SERIAL NOT NULL PRIMARY KEY,
       store_name VARCHAR(172) NOT NULL,
       store_location geometry(Point,4326) NOT NULL,
       store_description TEXT NULL,
       store_schedule tstzrange NULL,
       store_creation_time timestamp NOT NULL,
       store_appuser_id int NULL REFERENCES app.appuser (appuser_id)
);

CREATE TABLE app.tag (
       tag_id SERIAL NOT NULL PRIMARY KEY,
       tag_name varchar(70) NOT NULL,
       tag_description text
);

CREATE TABLE app.storetag (
       storetag_store_id int NOT NULL REFERENCES app.store (store_id) ON UPDATE CASCADE ON DELETE CASCADE,
       storetag_tag_id int NOT NULL REFERENCES app.tag (tag_id) ON UPDATE CASCADE ON DELETE CASCADE,
       PRIMARY KEY (storetag_store_id,storetag_tag_id)
);


CREATE TABLE app.product (
       product_id SERIAL NOT NULL PRIMARY KEY,
       product_name VARCHAR(70) NOT NULL,
       product_description TEXT
);

CREATE TABLE app.producttag (
       producttag_product_id int NOT NULL REFERENCES app.product (product_id) ON UPDATE CASCADE ON DELETE CASCADE,
       producttag_tag_id int NOT NULL REFERENCES app.tag (tag_id) ON UPDATE CASCADE ON DELETE CASCADE,
       PRIMARY KEY (producttag_product_id,producttag_tag_id)
);

CREATE TABLE app.price (
       price_id SERIAL NOT NULL PRIMARY KEY,
       price_value NUMERIC(10,2) NOT NULL,
       price_timestamp timestamp NOT NULL,
       price_appuser_id int NULL REFERENCES app.appuser (appuser_id) ON UPDATE CASCADE
);

CREATE TABLE app.pricereview (
       pricereview_id SERIAL NOT NULL PRIMARY KEY,
       pricereview_score INT NOT NULL,
       pricereview_creation_timestamp timestamp NOT NULL,
       pricereview_modification_timestamp timestamp NOT NULL,
       pricereview_comment TEXT,
       pricereview_appuser_id int NOT NULL REFERENCES app.appuser (appuser_id) ON UPDATE CASCADE,
       pricereview_price_id int NOT NULL REFERENCES app.price (price_id) ON UPDATE CASCADE
);




CREATE TABLE app.productatstore (
       productatstore_id SERIAL NOT NULL PRIMARY KEY,
       productatstore_availability int NULL,
       -- TODO:Check data type for availability
       productatstore_store_id int NOT NULL REFERENCES app.store (store_id) ON UPDATE CASCADE ON DELETE CASCADE,
       productatstore_product_id int NOT NULL REFERENCES app.product (product_id) ON UPDATE CASCADE ON DELETE CASCADE,
       productatstore_price_id int NOT NULL REFERENCES app.price (price_id) ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE PROCEDURE app.create_product(
    n varchar(70),
    description text = NULL
)
LANGUAGE SQL
BEGIN ATOMIC
    INSERT INTO app.product (product_name, product_description)
    VALUES (n, description);
END;

CREATE PROCEDURE app.create_store(
       n varchar(172),
       lon double precision,
       lat double precision,
       user_id int = NULL,
       description text = NULL,
       schedule tstzrange = NULL
       )
LANGUAGE SQL
BEGIN ATOMIC
      INSERT INTO app.store (store_name,store_location,store_appuser_id,store_description,store_schedule,store_creation_time)
      VALUES (n,ST_Point(lon,lat,4326),user_id,description,schedule,NOW());
END;



CREATE PROCEDURE app.create_user(
    n varchar(70),
    pass varchar(70),
    state bool
)
LANGUAGE SQL
BEGIN ATOMIC
    INSERT INTO app.appuser (appuser_name, appuser_password, appuser_creation_date, appuser_state)
    VALUES (n, pass, NOW(), state);
END;

CREATE PROCEDURE app.create_price(
    val numeric(10,2),
    id_user int = NULL
)
LANGUAGE SQL
BEGIN ATOMIC
    INSERT INTO app.price(price_value, price_timestamp, price_appuser_id)
    VALUES (val, NOW(), id_user);
END;

CREATE PROCEDURE app.create_role(
    n varchar(70)
)
LANGUAGE SQL
BEGIN ATOMIC
    INSERT INTO app.role(role_name)
    VALUES (n);
END;

CREATE PROCEDURE app.assign_role(
    id_role int,
    id_user int
)
LANGUAGE SQL
BEGIN ATOMIC
    INSERT INTO app.appuserrole(appuserrole_role_id, appuserrole_appuser_id)
    VALUES (id_role, id_user);
END;

CREATE PROCEDURE app.assign_product_tag(
    id_product int,
    id_tag int
)
LANGUAGE SQL
BEGIN ATOMIC
    INSERT INTO app.producttag(producttag_product_id, producttag_tag_id)
    VALUES (id_product, id_tag);
END;

CREATE PROCEDURE app.create_price_review(
    score int,
    id_price int,
    comment text = NULL,
    id_user int = NULL
)
LANGUAGE SQL
BEGIN ATOMIC
    INSERT INTO app.pricereview(pricereview_score, pricereview_creation_timestamp, pricereview_modification_timestamp,
       pricereview_comment, pricereview_appuser_id, pricereview_price_id)
    VALUES (score, NOW(), NOW(), comment, id_user, id_price);
END;

CREATE PROCEDURE app.assign_product_to_store(
    availability int,
    id_product int,
    id_store int,
    id_price int
)
LANGUAGE SQL
BEGIN ATOMIC
    INSERT INTO app.productatstore(productatstore_availability, productatstore_product_id, productatstore_store_id, productatstore_price_id)
    VALUES (availability, id_product, id_store, id_price);
END;
-- -- Example query
-- SELECT store_name, tag_name
-- FROM store
-- LEFT JOIN storetag
-- ON storetag_store_id = store_id
-- LEFT JOIN tag
-- ON storetag_tag_id = tag_id;
