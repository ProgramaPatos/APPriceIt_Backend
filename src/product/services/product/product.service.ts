import { ForbiddenException, Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { IDatabase } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import ProductCreateDTO from 'src/product/dto/product-create.dto';
import { ProductQueryDTO } from 'src/product/dto/product-query.dto';
import ProductResponseDTO from 'src/product/dto/product-response.dto';
import { ProductUpdateDTO } from 'src/product/dto/product-update.dto';

@Injectable()
export class ProductService {
    constructor(
        @Inject('POSTGRES_PROVIDER')
        private pgdb: IDatabase<{}, IClient>,
    ) {}

    async findOneProduct(id: number): Promise<ProductResponseDTO> {
        const res = (await this.pgdb.func("fun.get_product",
            [id]
        )) as ProductResponseDTO[];

        if (res.length == 0) {
            throw new NotFoundException(`Product with id "${id}" does not exist`);
        } else if (res.length > 1) {
            throw new UnprocessableEntityException(
                `Multiple products with ${id} found`,
            );
        }
        return res[0];
    }

    async searchProduct({ name }: ProductQueryDTO) {
        const res = (await this.pgdb.func("fun.get_product_with_name", [name]));
        if (res.length == 0) {
            throw new NotFoundException(`No product name matches "${name}"`);
        }
        return res;
    }

    async createProduct(newProduct: ProductCreateDTO) {
        await this.pgdb.proc("fun.create_product", [
            newProduct.product_appuser_id,
            newProduct.product_name,
            newProduct.product_description
        ])
    }

    async updateProduct(product_id: number, updatedProduct: ProductUpdateDTO) {

        const res = (
            await this.pgdb.func('fun.update_product', [
                updatedProduct.product_appuser_id,
                product_id,
                updatedProduct.product_name,
                updatedProduct.product_description
            ])
        );

        if (res === -1) {
            throw new NotFoundException(`Product with id "${product_id}" does not exist`);
        } else if (res === -2) {
            throw new ForbiddenException(
                `Product with id "${product_id}" was not created` +
                ` by user with id "${updatedProduct.product_appuser_id}"`,
            );
        }

    }
    async deleteProduct(product_id: number) {
        await this.pgdb.proc("fun.delete_product", [
            product_id
        ])
    }
}
