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
  UseGuards,
  Delete,
  Request,
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
  ApiBearerAuth,
  refs,
} from '@nestjs/swagger';
import ProductResponseDTO from 'src/product/dto/product-response.dto';
import ProductWithPricesResponseDTO from 'src/product/dto/product-with-prices-response.dto';
import StoreCreateDTO from '../dtos/store-create.dto';
import StoreQueryDTO from '../dtos/store-query.dto';
import StoreResponseDTO from '../dtos/store-response.dto';
import StoreUpdateDTO from '../dtos/store-update.dto';
import { StoreService } from '../services/store.service';
import { Public } from 'src/auth/public.decorator';
import { ACGuard, UseRoles, UserRoles } from 'nest-access-control';
import StoreAssignProductDTO from '../dtos/store-assign-product.dto';
import StoreAssignPriceDTO from '../dtos/store-assign-price.dto';
import StoreIdResponseDTO from '../dtos/store-id.dto';



type ProductResponse<WithPrice extends boolean> = WithPrice extends true ? ProductWithPricesResponseDTO : ProductResponseDTO;

@ApiBearerAuth()
@ApiTags('store')
@Controller('store')
export class StoreController {
  constructor(private storeService: StoreService) {}

  // Be careful with the order of these two methods, if the :id route
  // is defined first it will validate an int, 'search' isn't an id so it fails
  // without forwarding to the searchStore method

  /*
   * Searches for stores within `distance` meters of coords (`lat`,`lon`),
   * with a name that matches `product_id` if provided
   */
  @Get('/search')
  @ApiOkResponse({
    description: 'One or more stores found.',
    type: StoreResponseDTO,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'No store found.' })
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
  @ApiOkResponse({
    description: 'One or more products found for store.',
    type: ProductWithPricesResponseDTO,
    isArray: true,
  })
  @ApiNotFoundResponse({ description: 'No store found.' })
  getStoreProducts(@Param("storeId", ParseIntPipe) storeId: number): Promise<ProductWithPricesResponseDTO[]> {
    return this.storeService.storeProducts(storeId);
  }
  /*
   * Creates a new store
   */
  @Post()
  //@HttpCode(HttpStatus.NO_CONTENT) // It doesn't return anything or we'd use 201
  @ApiNoContentResponse({
    description: 'The store has been successfully created.',
  })
  async createStore(@Body() payload: StoreCreateDTO, @Request() req): Promise<StoreIdResponseDTO> {
    return this.storeService.createStore(payload,req.user.userId);
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
  //@HttpCode(HttpStatus.NO_CONTENT) // It doesn't return anything or we'd use 201
  async updateStore(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() payload: StoreUpdateDTO,
    @Request() req,
  ): Promise<StoreIdResponseDTO> {
    return await this.storeService.updateStore(storeId, payload, req.user.userId);
  }

  // TODO: add delete method
  @ApiNoContentResponse({
    description: 'The store has been successfully deleted.',
  })
  @Delete(':storeId')
  async deleteStore(@Param('storeId', ParseIntPipe) storeId: number,@Request() req){
    await this.storeService.deleteStore(storeId,req.user.userId);
  }

  /*
   * Assign a product with id `productId` to the store with id `storeId`
   */
  @Post(':storeId/products/:productId')
  async addProduct(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req,
    @Body() payload: StoreAssignProductDTO){
      await this.storeService.addProduct(req.user.userId, productId, storeId, payload);
  }
  /*
   * Assign a prize with id `productId` in the store with id `storeId`.
   */
  @Post(':storeId/products/:productId/price')
  async assignPrice(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req,
    @Body() payload: StoreAssignPriceDTO){
      await this.storeService.assignPrice(req.user.userId, productId, storeId, payload);
  }

  @Put(':storeId/products/:productId/price')
  async updatePrice(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Request() req,
    @Body() payload: StoreAssignPriceDTO){
      await this.storeService.updatePrice(req.user.userId, productId, storeId, payload);
  }

  @Delete(':storeId/products/:productId/price/:priceId')
  async deletePrice(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('productId', ParseIntPipe) productId: number,
    @Param('priceId', ParseIntPipe) priceId: number,
    @Request() req){
      await this.storeService.deletePrice(req.user.userId, productId, storeId, priceId);
  }
}
