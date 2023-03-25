import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { StoresController } from './controllers/stores/stores.controller';
import { StoresService } from './services/stores/stores.service';
import { PostgresProvider } from './database/postgres.providers';
import { StoresModule } from './stores/stores.module';


@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), StoresModule],
  controllers: [AppController, StoresController],
  providers: [AppService, StoresService, PostgresProvider],
})
export class AppModule {}
