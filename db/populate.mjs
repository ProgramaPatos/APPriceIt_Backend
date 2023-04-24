import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import pgPromise from 'pg-promise';
import { faker } from '@faker-js/faker';


console.log(dotenvExpand);
const config = dotenv.config();
dotenvExpand.expand(config);


const initOptions = {};
const pgp = pgPromise(initOptions);
const pgdb = pgp(process.env.DB_ADMIN_CONNECTION_STRING);
const env = process.env.ENV;

function getRandomSubarray(arr, size) {
  var shuffled = arr.slice(0), i = arr.length, temp, index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


const adminId = (await pgdb.query(`SELECT appuser_id FROM ${env}.appuser`))[0].appuser_id;

let products = await pgdb.any(`SELECT * FROM ${env}.product`);
if (products.length == 0) {
  console.log("Creating products");
  const N_PRODUCTS = 10;
  const productsToCreate = Array(N_PRODUCTS).fill(0).map((_) => {
    const name = faker.commerce.productName();
    const description = faker.commerce.productDescription();
    return { name, description };
  })
  const productQuery = (`INSERT INTO ${env}.product (product_name,product_description,product_creation_time,product_appuser_id) VALUES ${productsToCreate.map(
    ({ name, description }) => `('${name}','${description}',NOW(),${adminId})`).join(",")};`);
  console.log(productQuery);
  //
  await pgdb.query(productQuery);
  products = await pgdb.any(`SELECT * FROM ${env}.product`);
}

const stores = await pgdb.any(`SELECT * FROM ${env}.store`);

let productatstore = await pgdb.any(`SELECT * FROM ${env}.productatstore`);
if (productatstore.length == 0) {
  console.log("adding product to stores");
  const MIN_PBS = 3
  const MAX_PBS = 6

  stores.map((s) => {
    getRandomSubarray(products, getRandomInt(MIN_PBS, MAX_PBS))
      .map((p) => {
        pgdb.proc("fun.assign_product_to_store", [adminId, p.product_id, s.store_id])
      })
  });
  productatstore = await pgdb.any(`SELECT * FROM ${env}.productatstore`);
}

let prices = await pgdb.any(`SELECT * FROM ${env}.price`);
if (prices.length == 0) {
  console.log("creating prices")
  const MIN_PRICE = 100;
  const MAX_PRICE = 100000;

  productatstore.map((s) => {
    const nPrices = getRandomInt(1, 3);
    for (let i = 0; i < nPrices; i++) {
      const this_price = faker.commerce.price(MIN_PRICE, MAX_PRICE, 2);
      pgdb.query(`INSERT INTO ${env}.price (price_value, price_creation_time, price_appuser_id, price_productatstore_id) VALUES (${this_price},NOW(),'${adminId}','${s.productatstore_id}')`);
    }
  });
  prices = await pgdb.any(`SELECT * FROM ${env}.price`);
}
console.log("done");









