import { Injectable, NotFoundException } from '@nestjs/common';
import { Store } from '../../interfaces/stores/stores.interface';
import { CreateStoreDTO, UpdateStoreDTO } from '../../dtos/stores.dto';

@Injectable()
export class StoresService {
  private counter = 1;
  private stores: Store[] = [
    {
      store_id: 1,
      store_name: 'string',
      store_location: 'string',
      store_description: 'string',
      store_schedule: 'string;',
      store_creation_time: 'string;',
      store_appuser_id: 'number;',
    },
  ];

  findAllStores() {
    return this.stores;
  }

  findOneStore(id: number) {
    if (!this.stores.find((store) => store.id === id))
      throw new NotFoundException(`Store ${id} not found`);
    return this.stores.find((store) => store.id === id);
  }

  createStore(newStore: CreateStoreDTO) {
    this.counter++;
    newStore.id = this.counter;
    this.stores.push(newStore);
    return this.stores[this.stores.length - 1];
  }

  updateStore(id: number, updatedStore: UpdateStoreDTO) {
    const storeIndex = this.stores.findIndex((store) => store.id === id);
    if (!this.stores[storeIndex])
      throw new NotFoundException(`Store ${id} not found`);
    this.stores[storeIndex] = {
      ...this.stores[storeIndex],
      ...updatedStore,
    };
    return this.stores[storeIndex];
  }

  deleteStore(id: number) {
    const storeIndex = this.stores.findIndex((store) => store.id === id);
    if (!this.stores[storeIndex])
      throw new NotFoundException(`Store ${id} not found`);
    this.stores.splice(storeIndex, 1);
    return true;
  }
}
