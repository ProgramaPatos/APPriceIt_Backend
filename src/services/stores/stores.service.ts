import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Store } from '../../interfaces/stores/stores.interface';
import { CreateStoreDTO, UpdateStoreDTO } from '../../dtos/stores.dto';
import { IDatabase } from 'pg-promise';
import pg, { IClient } from 'pg-promise/typescript/pg-subset';

@Injectable()
export class StoresService {
  constructor(
    @Inject("POSTGRES_PROVIDER")
    private pgdb: IDatabase<{}, IClient>
  ) {}
  private counter = 1;
  private stores: Store[] = [
    {
      store_id: 42,
      store_name: 'string',
      store_location: 'string',
      store_description: 'string',
      store_schedule: 'string;',
      store_creation_time: 'string;',
      store_appuser_id: 1,
    },
  ];

  findAllStores() {
    return this.stores;
  }

  findOneStore(id: number) {
    if (!this.stores.find((store) => store.store_id === id))
      throw new NotFoundException(`Store ${id} not found`);
    return this.stores.find((store) => store.store_id === id);
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

  updateStore(id: number, updatedStore: UpdateStoreDTO) {
    const storeIndex = this.stores.findIndex((store) => store.store_id === id);
    if (!this.stores[storeIndex])
      throw new NotFoundException(`Store ${id} not found`);
    this.stores[storeIndex] = {
      ...this.stores[storeIndex],
      ...updatedStore,
    };
    return this.stores[storeIndex];
  }

  deleteStore(id: number) {
    const storeIndex = this.stores.findIndex((store) => store.store_id === id);
    if (!this.stores[storeIndex])
      throw new NotFoundException(`Store ${id} not found`);
    this.stores.splice(storeIndex, 1);
    return true;
  }
}
