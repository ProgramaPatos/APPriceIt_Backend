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
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
  ApiUnprocessableEntityResponse,
  refs,
} from '@nestjs/swagger';
import ProductResponseDTO from 'src/product/dto/product-response.dto';
import ProductWithPricesResponseDTO from 'src/product/dto/product-with-prices-response.dto';
import StoreCreateDTO from '../dtos/store-create.dto';
import StoreProductsQueryDTO from '../dtos/store-products-query.dto';
import StoreQueryDTO from '../dtos/store-query.dto';
import StoreResponseDTO from '../dtos/store-response.dto';
import StoreUpdateDTO from '../dtos/store-update.dto';
import { StoreService } from '../services/store.service';
import { Public } from 'src/auth/public.decorator';


type ProductResponse<WithPrice extends boolean> = WithPrice extends true ? ProductWithPricesResponseDTO : ProductResponseDTO;

@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private storeService: StoreService) {}

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
  searchStores(@Query() storeQuery: StoreQueryDTO): Promise<StoreResponseDTO[]> {
    return this.storeService.searchStores(storeQuery);
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
  ): Promise<StoreResponseDTO> {
    return this.storeService.findOneStore(storeId);
  }


  /*
   * Gets products registered for store
   */
  @Get(':storeId/products')
  @ApiTags("product")
  @ApiQuery({
    type: StoreProductsQueryDTO
  })
  @ApiExtraModels(ProductWithPricesResponseDTO)
  @ApiOkResponse({
    description: 'One or more products found for store.',
    schema: { oneOf: refs(ProductResponseDTO, ProductWithPricesResponseDTO) },
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'No store found.' })
  @Public()
  getStoreProducts<W extends StoreProductsQueryDTO>(@Param("storeId", ParseIntPipe) storeId: number, @Query() storeProductsQuery: W): Promise<ProductResponse<W['withPrices']>[]> {
    return this.storeService.getStoreProducts(storeId, storeProductsQuery);
  }
  /*
   * Creates a new store
   */
  @Post()
  @HttpCode(HttpStatus.NO_CONTENT) // It doesn't return anything or we'd use 201
  @ApiNoContentResponse({
    description: 'The store has been successfully created.',
  })
  createStore(@Body() payload: StoreCreateDTO): void {
    this.storeService.createStore(payload);
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
  ): void {
    this.storeService.updateStore(storeId, payload);
  }

  // TODO: add delete method
}
