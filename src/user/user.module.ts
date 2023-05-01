import { Module } from '@nestjs/common';
import { userService } from './services/user.service';
import { PostgresModule } from 'src/postgres/postgres.module';

@Module({
  providers: [userService],
  exports: [userService],
  imports: [PostgresModule],
})
export class UsersModule {}
