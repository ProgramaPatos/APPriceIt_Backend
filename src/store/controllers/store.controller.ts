import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import StoreCreateDTO from '../dtos/store-create.dto';
import StoreQueryDTO from '../dtos/store-query.dto';
import StoreResponseDTO from '../dtos/store-response.dto';
import StoreUpdateDTO from '../dtos/store-update.dto';
import { StoreService } from '../services/store.service';
import { Public } from 'src/auth/public.decorator';

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private storesService: StoreService) {}


  // Be careful with the order of these two methods, if the :id route
  // is defined first it will validate an int, 'search' isn't an id so it fails
  // without forwarding to the searchStore method

  /*
   * Searches for stores within `distance` meters of coords (`lat`,`lon`),
   * with a name that matches `name_prefix` if provided
   */
  @Get('/search')
  @ApiOkResponse({
    description: 'One or more stores found.',
    type: StoreResponseDTO,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'No store found.' })
  @Public()
  searchStores(@Query() storeQuery: StoreQueryDTO) {
    return this.storesService.searchStores(storeQuery);
  }

  /*
   * Returns information of store with `storeId`
   */
  @Get(':storeId')
  @ApiOkResponse({
    description: 'The store is retrieved.',
    type: StoreResponseDTO,
  })
  @ApiNotFoundResponse({ description: 'The store does not exist.' })
  @ApiUnprocessableEntityResponse({
    description: 'Multiple stores with same id found.',
  })
  //@Public()
  getStore(
    @Param('storeId', ParseIntPipe) storeId: number,
  ): Promise<StoreQueryDTO> {
    return this.storesService.findOneStore(storeId);
  }

  /*
   * Creates a new store
   */
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT) // It doesn't return anything or we'd use 201
  @ApiNoContentResponse({
    description: 'The store has been successfully created.',
  })
  createStore(@Body() payload: StoreCreateDTO): any {
    this.storesService.createStore(payload);
  }

  /*
   * Updates *ALL* fields of an existing store with id `storeId`
   */
  @ApiNoContentResponse({
    description: 'The store has been successfully updated.',
  })
  @ApiForbiddenResponse({ description: 'The user cannot modify store data.' })
  @ApiNotFoundResponse({ description: 'The store does not exist.' })
  @Put(':storeId')
  @HttpCode(HttpStatus.NO_CONTENT) // It doesn't return anything or we'd use 201
  updateStore(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() payload: StoreUpdateDTO,
  ) {
    this.storesService.updateStore(storeId, payload);
  }

  // TODO: add delete method
}
