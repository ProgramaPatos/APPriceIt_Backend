import {
  Body, Controller, Delete, Get, HttpCode,
  HttpStatus, Param, ParseIntPipe, Post, Put, Query
} from '@nestjs/common';
import { ApiForbiddenResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import StoreCreateDTO from '../dtos/store-create.dto';
import StoreQueryDTO from '../dtos/store-query.dto';
import StoreResponseDTO from '../dtos/store-response.dto';
import StoreUpdateDTO from '../dtos/store-update.dto';
import { StoreService } from '../services/store.service';

@ApiTags("store")
@Controller('store')
export class StoreController {
  constructor(private storesService: StoreService) {}

  // Be careful with the order of these two methods, if the :id route
  // is defined first it will validate an int, 'search' isn't an id so it fails
  // without forwarding to the searchStore method

  /*
   * Searches for stores within `distance` meters of coords (`lat`,`lon`), with a name that matches `name_prefix` if provided
   */
  @Get('/search') // e.g. ".../store/search?lat=4.637252&lon=-74.083900&distance=1000"
  @ApiOkResponse({ description: "One or more stores found.", type: StoreResponseDTO, isArray: true })
  @ApiNotFoundResponse({ description: "No store found." })
  searchStores(@Query() storeQuery: StoreQueryDTO) {
    return this.storesService.searchStores(storeQuery);
  }

  /*
   * Returns information of store with `storeId`
   */
  @Get(':storeId') // e.g. ".../store/1"
  @ApiOkResponse({ description: "The store is retrieved.", type: StoreResponseDTO })
  @ApiNotFoundResponse({ description: "The store does not exist." })
  @ApiUnprocessableEntityResponse({ description: "Multiple stores with same id found." })
  getStore(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.storesService.findOneStore(storeId);
  }

  /*
   * Creates a new store
   */
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT) // It doesn't return anything else we'd use 201
  @ApiNoContentResponse({ description: "The store has been successfully created." })
  createStore(@Body() payload: StoreCreateDTO): any {
    this.storesService.createStore(payload);
  }

  /*
   * Updates *ALL* fields of an existing store with id `storeId`
   */
  @ApiNoContentResponse({ description: "The store has been successfully updated." })
  @ApiForbiddenResponse({ description: "The user cannot modify store data." })
  @ApiNotFoundResponse({ description: "The store does not exist." })
  @Put(':storeId')
  @HttpCode(HttpStatus.NO_CONTENT) // It doesn't return anything else we'd use 201
  updateStore(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() payload: StoreUpdateDTO,
  ) {
    this.storesService.updateStore(storeId, payload);
  }

  // TODO: add delete method
}
