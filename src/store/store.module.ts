import { Module } from '@nestjs/common';
import { PostgresModule } from 'src/postgres/postgres.module';
import { StoreController } from './controllers/store.controller';
import { StoreService } from './services/store.service';

@Module({
  controllers: [StoreController],
  providers: [StoreService],
  imports: [PostgresModule],
})
export class StoreModule {}
