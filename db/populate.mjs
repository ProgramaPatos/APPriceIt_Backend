import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import pgPromise from 'pg-promise';
import { faker } from '@faker-js/faker';


const config = dotenv.config();
dotenvExpand.expand(config);


const initOptions = {};
const pgp = pgPromise(initOptions);
const pgdb = pgp(process.env.DB_ADMIN_CONNECTION_STRING);
const env = process.env.ENV;

const getRandomSubarray = (arr, size) => {
  var shuffled = arr.slice(0), i = arr.length, temp, index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
};

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const createValue = (vals) => {
  return `(${vals.map((v) => {
    if (vals != "NOW()" && (typeof v === 'string' || v instanceof String)) {
      return `'${v}'`;
    }
    return v;
  })})`;
};

const createValues = (vals) => `${vals.map((v) => createValue(v)).join(",")}`;


const adminId = (await pgdb.query(`SELECT appuser_id FROM ${env}.appuser`))[0].appuser_id;

let products = await pgdb.any(`SELECT * FROM ${env}.product`);
if (products.length == 0) {
  console.log("Creating products");
  const N_PRODUCTS = 10;
  const productsToCreate = Array(N_PRODUCTS).fill(0).map((_) => {
    const name = faker.commerce.productName();
    const description = faker.commerce.productDescription();
    return {
      product_name: name,
      product_description: description,
      product_appuser_id: adminId
    };
  })

  const productQuery = pgp.helpers.insert(
    productsToCreate,
    ["product_name", "product_description", "product_appuser_id"],
    { table: `product`, schema: `${env}` }
  );
  // `INSERT INTO ${env}.product (product_name,product_description,product_creation_time,product_appuser_id)
  //  VALUES ${createValues(productsToCreate)}`;
  await pgdb.none(productQuery);
  products = await pgdb.any(`SELECT * FROM ${env}.product`);
}

const stores = await pgdb.any(`SELECT * FROM ${env}.store`);

let productatstore = await pgdb.any(`SELECT * FROM ${env}.productatstore`);
if (productatstore.length == 0) {
  console.log("adding product to stores");
  const MIN_PBS = 3
  const MAX_PBS = 6

  const productAtStoresAssignment = stores.flatMap((s) => {
    const subarr = getRandomSubarray(products, getRandomInt(MIN_PBS, MAX_PBS));
    // console.log(subarr);
    return subarr
      .map((p) => ({
        productatstore_availability: getRandomInt(0, 20),
        productatstore_product_id: p.product_id,
        productatstore_store_id: s.store_id,
        productatstore_appuser_id: adminId,
      }))
  });

  const query = pgp.helpers.insert(
    productAtStoresAssignment,
    [
      "productatstore_availability",
      "productatstore_product_id",
      "productatstore_store_id",
      "productatstore_appuser_id"
    ],
    { table: `productatstore`, schema: `${env}` }
  );
  // console.log(query);
  // const productAtStoreQuery =
  //   ` INSERT INTO ${env}.productatstore
  //   (productatstore_availability, productatstore_product_id, productatstore_store_id, productatstore_appuser_id)
  //   VALUES ${createValues(productAtStoresAssignment)}`;
  pgdb.none(query);


  productatstore = await pgdb.any(`SELECT * FROM ${env}.productatstore`);
}

let prices = await pgdb.any(`SELECT * FROM ${env}.price`);
console.log("product at store", productatstore);
if (prices.length == 0) {
  console.log("creating prices")
  const MIN_PRICE = 100;
  const MAX_PRICE = 100000;

  const pricesToCreate = productatstore.flatMap((s) => {
    const nPrices = getRandomInt(1, 3);
    const psPrices = Array(nPrices).fill(0);


    for (let i = 0; i < nPrices; i++) {
      const thisPrice = faker.commerce.price(MIN_PRICE, MAX_PRICE, 2);
      psPrices[i] = {
        price_value: thisPrice,
        price_appuser_id: adminId,
        price_productatstore_id: s.productatstore_id
      }
    }
    return psPrices;
  });
  const query = pgp.helpers.insert(
    pricesToCreate,
    [
      "price_value",
      "price_appuser_id",
      "price_productatstore_id",
    ],
    { table: `price`, schema: `${env}` }
  );
  pgdb.none(query);
  prices = await pgdb.any(`SELECT * FROM ${env}.price`);
}
pgdb.$pool.end();
pgp.end();
console.log("done");
