import { Controller, Get, Delete, UseGuards, ParseIntPipe, Request, Param, Put, HttpCode, Body, HttpStatus, Post, SetMetadata, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiUnprocessableEntityResponse, ApiOkResponse, ApiNoContentResponse, ApiForbiddenResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import ProductCreateDTO from 'src/product/dto/product-create.dto';
import { ProductQueryDTO } from 'src/product/dto/product-query.dto';
import ProductResponseDTO from 'src/product/dto/product-response.dto';
import { ProductUpdateDTO } from 'src/product/dto/product-update.dto';
import { ProductService } from 'src/product/services/product/product.service';
import { ACGuard, UseRoles, UserRoles } from 'nest-access-control';
import ProductIdResponseDto from 'src/product/dto/product-id.dto';


@ApiBearerAuth()
@ApiTags('product')
@Controller('product')
export class ProductController {

    constructor(
        private productService: ProductService
    ) {}

    @Get('/search')
    @ApiOkResponse({
        description: 'The products that match `name` are returned',
        type: ProductResponseDTO,
        isArray: true
    })
    @ApiNotFoundResponse({
        description: 'No product matches `name`'
    })
    searchProduct(@Query() query: ProductQueryDTO) {
        return this.productService.searchProduct(query);
    }

    @Get(':productId')
    @ApiOkResponse({
        description: 'The product info is retrieved',
        type: ProductResponseDTO
    })
    @ApiNotFoundResponse({
        description: 'The product does not exist.'
    })
    @ApiUnprocessableEntityResponse({
        description: 'Multiple products with same id found.'
    })
    getProduct(
        @Param('productId', ParseIntPipe) productId: number
    ) {
        return this.productService.findOneProduct(productId);
    }

    /*
     * Creates a new product
     */
    @Post()
    //@HttpCode(HttpStatus.NO_CONTENT) // It doesn't return anything or we'd use 201
    @ApiNoContentResponse({
        description: 'The product has been successfully created.',
    })
    async createProduct(@Body() payload: ProductCreateDTO,@Request() req): Promise<ProductIdResponseDto> {
        return await this.productService.createProduct(payload,req.user.userId);
    }


    /*
     * Updates *ALL* fields of an existing product with id `productId`
     */
    @ApiNoContentResponse({
        description: 'The product has been successfully updated.',
    })
    @ApiForbiddenResponse({ description: 'The user cannot modify product data.' })
    @ApiNotFoundResponse({ description: 'The product does not exist.' })
    @Put(':productId')
    //@HttpCode(HttpStatus.NO_CONTENT) // It doesn't return anything or we'd use 201
    async updateProduct(
        @Param('productId', ParseIntPipe) productId: number,
        @Body() payload: ProductUpdateDTO,
        @Request() req
    ): Promise<ProductIdResponseDto> {
        return await this.productService.updateProduct(productId, payload,req.user.userId);
    }
    
    /*
     * Delete a product
     */
    @Delete(':productId')
    @UseGuards(ACGuard)
    @UseRoles({
        possession: 'any',
        action: 'delete',
        resource: 'product'
    })
    @HttpCode(HttpStatus.NO_CONTENT) // It doesn't return anything or we'd use 201
    @ApiNoContentResponse({
        description: 'The product has been successfully deleted.',
    })
    deleteProduct(@Param('productId', ParseIntPipe) productId: number,@Request() req): void {
        this.productService.deleteProduct(productId);
    }
}
