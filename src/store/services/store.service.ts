import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { IDatabase } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import StoreCreateDTO from '../dtos/store-create.dto';
import StoreQueryDTO from '../dtos/store-query.dto';
import StoreResponseDTO from '../dtos/store-response.dto';
import StoreUpdateDTO from '../dtos/store-update.dto';
import StoreAssignProductDTO from '../dtos/store-assign-product.dto';
import StoreAssignPriceDTO from '../dtos/store-assign-price.dto';

@Injectable()
export class StoreService {
  // TODO: Enable error validation from pg-promises and propagate errors
  constructor(
    @Inject('POSTGRES_PROVIDER')
    private pgdb: IDatabase<{}, IClient>,
  ) {}

  async findOneStore(id: number): Promise<StoreResponseDTO> {
    const res = (await this.pgdb.func('fun.get_store', [
      id,
    ])) as StoreResponseDTO[];
    if (res.length == 0) {
      throw new NotFoundException(`Store with id "${id}" does not exist`);
    } else if (res.length > 1) {
      throw new UnprocessableEntityException(
        `Multiple stores with ${id} found`,
      );
    }
    return res[0];
  }

  async createStore(newStore: StoreCreateDTO) {
    await this.pgdb.proc('fun.create_store', [
      newStore.store_appuser_id,
      newStore.store_name,
      newStore.store_lat,
      newStore.store_lon,
      newStore.store_description,
      newStore.store_schedule,
    ]);
  }


  async searchStores(query: StoreQueryDTO): Promise<StoreResponseDTO[]> {
    const { lat, lon, distance } = query;
    let res: StoreResponseDTO[];

    if (query.product_id) {
      res = await this.pgdb.func('fun.stores_with_product_within_distance', [
        query.product_id,
        lat,
        lon,
        distance + 0.1
      ]);
    }
    else {
      res = await this.pgdb.func('fun.stores_within_distance', [
        lat,
        lon,
        distance,
      ]);
    }

    if (res.length === 0) {
      throw new NotFoundException(

        `No store within ${distance} meters from (${lat},${lon})` +
        (query.product_id ? ` with product "${query.product_id}""` : ''),

      );
    }
    return res;
  }

  async updateStore(store_id: number, updatedStore: StoreUpdateDTO,) {
    const res = (
      await this.pgdb.func('fun.update_store', [
        updatedStore.store_appuser_id,
        store_id,
        updatedStore.store_name,
        updatedStore.store_lat,
        updatedStore.store_lon,
        updatedStore.store_description,
        updatedStore.store_schedule,
      ])
    )[0].update_store;
    if (res === -1) {
      throw new NotFoundException(`Store with id "${store_id}" does not exist`);
    } else if (res === -2) {
      throw new ForbiddenException(
        `Store with id "${store_id}" was not created` +
        ` by user with id "${updatedStore.store_appuser_id}"`,
      );
    }
  }

  async storeProducts(store_id: number) {
    let res;
    res = (await this.pgdb.func("fun.store_products", [store_id]));
    if (res.length == 0) {
      throw new NotFoundException(`Store with id ${store_id} has no registered products`);
    }
    return res;
  }

  async deleteStore(store_id: number, user_id: number){
    const res =  (await this.pgdb.func("fun.delete_store", [
      store_id, 
      user_id
    ]))[0].delete_store;
    if(res === -1){
      throw new NotFoundException(`Store with id "${store_id}" does not exist`);
    }else if (res === -2){
      throw new ForbiddenException(
        `Store with id "${store_id}" was not created` +
        ` by user with id "${user_id}"`,
      );
    }

  }

  async addProduct(user_id:number,product_id:number, store_id:number, availability:StoreAssignProductDTO){
    if(availability.product_availability === undefined){
      await this.pgdb.proc("fun.assign_product_to_store", [
        user_id,
        product_id,
        store_id
      ]);
    }else{
      await this.pgdb.proc("fun.assign_product_to_store", [
        user_id,
        product_id,
        store_id,
        availability.product_availability
      ]);
    }

  }

  async assignPrice(user_id:number,product_id:number, store_id:number, payload:StoreAssignPriceDTO){
    const res = (await this.pgdb.func("fun.create_price", [
      user_id,
      product_id,
      store_id,
      payload.product_price
    ]))[0].create_price;
    if(res === -1){
      throw new NotFoundException(`Product with id "${product_id}" does not exist at store with id "${store_id}"`);
    }
  }

  async updatePrice(user_id:number,product_id:number, store_id:number, payload:StoreAssignPriceDTO){
    const res = (await this.pgdb.func("fun.update_price", [
      user_id,
      product_id,
      store_id,
      payload.product_price
    ]))[0].create_price;
    if(res === -1){
      throw new NotFoundException(`Product with id "${product_id}" does not exist at store with id "${store_id}"`);
    }else if(res === -2){
      throw new NotFoundException(`Product with id "${product_id}" at store with id "${store_id}" does not have a price yet`);
    }
  }

  async deletePrice(user_id:number,product_id:number, store_id:number, price_id:number){
    const res = (await this.pgdb.func("fun.delete_price", [
      user_id,
      product_id,
      store_id,
      price_id
    ]))[0].delete_price;
    if(res === -1){
      throw new NotFoundException(`Price with id"${price_id}" does not exist for product with id "${product_id}" at store with id "${store_id}"`);
    }else if(res === -2){
      throw new ForbiddenException(`Price with id"${price_id}" was not created by user with id "${user_id}"`);
    }
  }
}
