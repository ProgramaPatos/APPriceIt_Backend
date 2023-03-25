import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { StoresService } from '../services/stores/stores.service';
import { StoresController } from '../controllers/stores/stores.controller';
import { PostgresProvider } from '../database/postgres.providers';
import { Store } from '../interfaces/stores/stores.interface';
import { AuthenticationMiddleware } from 'src/common/authentication.middleware';
import { ConfigModule } from '@nestjs/config';
import { AppService } from 'src/app.service';
import { AppController } from 'src/app.controller';
@Module({
    imports: [
        ConfigModule.forRoot({isGlobal: true}), StoresModule
    ], // add this
  providers: [AppService, StoresService, PostgresProvider],
  controllers: [AppController, StoresController]
})
export class StoresModule implements NestModule {
    configure(consumer: MiddlewareConsumer): MiddlewareConsumer | void {
      consumer.apply(AuthenticationMiddleware).forRoutes(
        { method: RequestMethod.POST, path: '/stores' },
        { method: RequestMethod.PUT, path: '/stores/:store_id' },
        { method: RequestMethod.DELETE, path: '/stores/:store_id' }
      )
    }
}