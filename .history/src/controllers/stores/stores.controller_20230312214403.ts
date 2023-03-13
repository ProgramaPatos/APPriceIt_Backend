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
import { CreateStoreDTO, UpdateStoreDTO } from '../../dtos/stores.dto';

@Controller('stores')
export class StoresController {
  constructor(private storesService: StoresService) {} //inyectamos el servicio no se si con readonly o no

  // @Get()
  // getStores(
  //    @Query('query') query: any,
  //    @Query('limit') limit = 100,
  //    @Query('offset') offset = 10,
  // ) {
  //    return {
  //       message: ` mi tienda ${query} y mi limite es ${limit} y mi offset es ${offset}`,
  //    };
  // }
  @Get()
  getStores() {
    return this.storesService.findAllStores();
  }

  @Get(':storeId') //stores/1 //no hace falta poner el /stores
  getStore(@Param('storeId', ParseIntPipe) storeId: number) {
    // return {
    //    message: ` mi tienda ${params.storeId}`,
    // };
    return this.storesService.findOneStore(storeId);
  }

  @Get(':storeId/info')
  getInfoStore(@Param('storeId', ParseIntPipe) storeId: number) {
    return {
      message: ` la info de mi tienda ${storeId}`,
    };
    //TODO: implementar el servicio
  }

  @Post() //casi siempre retorna un json con un post
  createStore(@Body() payload: CreateStoreDTO): any {
    // return {
    //    message: 'store created',
    //    payload,
    //    body: {
    //       name: 'string',
    //       description: 'string',
    //       price: 'number',
    //    },
    // };
    return this.storesService.createStore(payload);
  }

  @Put(':storeId')
  updateStore(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() payload: UpdateStoreDTO,
  ) {
    // return {
    //    message: `la tienda ${storeId} fue actualizada`,
    //    payload,
    // };
    return this.storesService.updateStore(storeId, payload);
  }

  @Delete(':storeId')
  deleteStore(@Param('storeId', ParseIntPipe) storeId: number) {
    // return {
    //    message: `la tienda ${storeId} fue eliminada`,
    // };
    return this.storesService.deleteStore(storeId);
  }
}
