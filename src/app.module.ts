import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StoreModule } from './store/store.module';
import { PostgresModule } from './postgres/postgres.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { AppLoggerMiddleware } from './middlewares/app-logger.middleware';
import { AccessControlModule } from 'nest-access-control';
import { roles } from './user/role/role.enum';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    StoreModule,
    PostgresModule,
    ProductModule,
    AuthModule,
    UsersModule,
    AccessControlModule.forRoles(roles),
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppLoggerMiddleware).forRoutes("*");
  }
}
