import { Module } from '@nestjs/common';
import { PostgresProvider } from './postgres.providers';

@Module({
  providers: [PostgresProvider],
  exports: [PostgresProvider],
})
export class PostgresModule {}
