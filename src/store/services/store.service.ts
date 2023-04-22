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

@Injectable()
export class StoreService {
  // TODO: Enable error validation from pg-promises and propagate errors
  constructor(
    @Inject('POSTGRES_PROVIDER')
    private pgdb: IDatabase<{}, IClient>,
  ) {}

  async findOneStore(id: number): Promise<StoreQueryDTO> {
    const res = (await this.pgdb.func('fun.get_store', [
      id,
    ])) as StoreQueryDTO[];
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
    name_prefix,
  }: StoreQueryDTO): Promise<StoreResponseDTO[]> {
    let res: StoreResponseDTO[];
    if (name_prefix) {
      res = await this.pgdb.func('fun.get_stores_within_distance_and_name', [
        lat,
        lon,
        distance,
        name_prefix,
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
        `No store within ${distance} meters of (${lat},${lon})` +
        (name_prefix ? ` with prefix "${name_prefix}""` : ''),
      );
    }
    return res;
  }

  async updateStore(
    store_id: number,
    {
      store_appuser_id,
      store_name,
      store_lat,
      store_lon,
      store_description,
      store_schedule,
    }: StoreUpdateDTO,
  ) {
    const res = (
      await this.pgdb.func('fun.update_store', [
        store_appuser_id,
        store_id,
        store_name,
        store_lat,
        store_lon,
        store_description,
        store_schedule,
      ])
    )[0].update_store;
    console.log(res);
    if (res === -1) {
      throw new NotFoundException(`Store with id "${store_id}" does not exist`);
    } else if (res === -2) {
      throw new ForbiddenException(
        `Store with id "${store_id}" was not created` +
        ` by user with id "${store_appuser_id}"`,
      );
    }
  }
}
