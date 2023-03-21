import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StoresController } from './controllers/stores/stores.controller';
import { StoresService } from './services/stores/stores.service';
import { DbModule } from './modules/db/db.module';

@Module({
  imports: [DbModule],
  controllers: [AppController, StoresController],
  providers: [AppService, StoresService],
})
export class AppModule {}
