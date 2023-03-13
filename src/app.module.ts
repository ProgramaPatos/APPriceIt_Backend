import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StoresController } from './controllers/stores/stores.controller';
import { StoresService } from './services/stores/stores.service';

@Module({
  imports: [],
  controllers: [AppController, StoresController],
  providers: [AppService, StoresService],
})
export class AppModule {}
