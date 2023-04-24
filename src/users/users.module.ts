import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { PostgresModule } from 'src/postgres/postgres.module';

@Module({
  providers: [UsersService],
  exports: [UsersService],
  imports: [PostgresModule],
})
export class UsersModule {}
