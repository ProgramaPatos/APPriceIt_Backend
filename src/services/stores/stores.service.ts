import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Store } from '../../interfaces/stores/stores.interface';
import { CreateStoreDTO, StoreWithinDTO, UpdateStoreDTO } from '../../dtos/stores.dto';
import { IDatabase } from 'pg-promise';
import pg, { IClient } from 'pg-promise/typescript/pg-subset';

@Injectable()
export class StoresService {
  constructor(
    @Inject("POSTGRES_PROVIDER")
    private pgdb: IDatabase<{}, IClient>
  ) {}
  private stores = []

  async findOneStore(id: number) {
    const res = await this.pgdb.func(
      "fun.get_store",
      [id]
    ) as Store[];
    if (res.length == 0) {
      throw new NotFoundException(`Store ${id} not found`);
    }
    else if (res.length > 1) {
      throw new Error(`Multiple stores with ${id} found`);
    }
    return res[0]
  }

  async createStore(newStore: CreateStoreDTO) {
    return await this.pgdb.proc(
      "fun.create_store",
      [
        newStore.store_name,
        newStore.store_lat,
        newStore.store_lon,
        newStore.store_appuser_id,
        newStore.store_description,
        newStore.store_schedule
      ]
    )
  }

  async getStoresWithin({ lat, lon, distance }: StoreWithinDTO) {
    return await this.pgdb.func(
      "fun.get_stores_within",
      [
        lat,
        lon,
        distance
      ]
    );
  }

  async updateStore(id: number, updatedStore: UpdateStoreDTO) {
    const res = await this.pgdb.func(
      "fun.update_store",
      [
        id,
        updatedStore.store_name,
        updatedStore.store_lat,
        updatedStore.store_lon,
        updatedStore.store_appuser_id,
        updatedStore.store_description,
        updatedStore.store_schedule
      ]
    ) as { "updated_id": number }[];
    if (res.length == 0) {
      throw new NotFoundException(`Store ${id} doesn't exist or it was not created by User ${updatedStore.store_appuser_id}`);
    }
    return res;
  }
}
