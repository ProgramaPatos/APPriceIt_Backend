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
import StoreProductsQueryDTO from '../dtos/store-products-query.dto';
import StoreQueryDTO from '../dtos/store-query.dto';
import StoreResponseDTO from '../dtos/store-response.dto';
import StoreUpdateDTO from '../dtos/store-update.dto';

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

  async searchStores({
    lat,
    lon,
    distance,
    product_id,
  }: StoreQueryDTO): Promise<StoreResponseDTO[]> {
    let res: StoreResponseDTO[];
    if (product_id) {
      res = await this.pgdb.func('fun.get_stores_within_distance_and_product', [
        lat,
        lon,
        distance,
        product_id,
      ]);
    } else {
      res = await this.pgdb.func('fun.get_stores_within_distance', [
        lat,
        lon,
        distance,
      ]);
    }

    if (res.length === 0) {
      throw new NotFoundException(
        `No store within ${distance} meters from (${lat},${lon})` +
        (product_id ? ` with product "${product_id}""` : ''),
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

  async getStoreProducts(store_id: number, { withPrices }: StoreProductsQueryDTO) {
    let res;
    if (withPrices) {
      res = (await this.pgdb.func("fun.get_store_products_with_prices", [store_id]))

    }
    else {
      res = (await this.pgdb.func("fun.get_store_products", [store_id]));
    }
    if (res.length == 0) {
      throw new NotFoundException(`Store with id ${store_id} has no registered products`);
    }
    return res;
  }

}
