import { Module } from '@nestjs/common';
import { userService } from './services/user.service';
import { PostgresModule } from 'src/postgres/postgres.module';
import { UserController } from './controllers/user/user.controller';

@Module({
  controllers: [UserController],
  providers: [userService],
  exports: [userService],
  imports: [PostgresModule],
})
export class UsersModule {}
