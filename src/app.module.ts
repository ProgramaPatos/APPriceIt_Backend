import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StoreModule } from './store/store.module';
import { PostgresModule } from './postgres/postgres.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    StoreModule,
    PostgresModule,
    ProductModule,
  ],
})
export class AppModule {}
