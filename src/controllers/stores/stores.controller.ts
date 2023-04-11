import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Body,
  Put,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { StoresService } from '../../services/stores/stores.service';
import { CreateStoreDTO, StoreWithinDTO, UpdateStoreDTO, StoreWithinNameDTO } from '../../dtos/stores.dto';

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {}

  @Get('/store/:storeId') //stores/1 //no hace falta poner el /stores
  getStore(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.storesService.findOneStore(storeId);
  }

  @Get('/within/distance')
  getStoreWithinDistance(@Body() payload: StoreWithinDTO) {
    return this.storesService.getStoresWithinDistance(payload);
  }

  @Get('/within/distance/name')
  getStoreWithinDistanceAndName(@Body() payload: StoreWithinNameDTO) {
    return this.storesService.getStoresWithinDistanceAndName(payload);
  }

  @Post() //casi siempre retorna un json con un post
  createStore(@Body() payload: CreateStoreDTO): any {
    return this.storesService.createStore(payload);
  }

  @Put(':storeId')
  updateStore(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() payload: UpdateStoreDTO,
  ) {
    return this.storesService.updateStore(storeId, payload);
  }
}
