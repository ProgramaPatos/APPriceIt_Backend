import { Module } from '@nestjs/common';
import { PG_CONNECTION } from '../../constants';

const dbProvider = {
  provide: PG_CONNECTION,
};

@Module({
  providers: [dbProvider],
})
export class DbModule {}
