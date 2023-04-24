import { Module } from '@nestjs/common';
import { PostgresModule } from 'src/postgres/postgres.module';
import { ProductController } from './controllers/product/product.controller';
import { ProductService } from './services/product/product.service';


@Module({
    controllers: [ProductController],
    providers: [ProductService],
    imports: [PostgresModule],
})
export class ProductModule {}
