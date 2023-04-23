import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserController } from './controllers/user.controllers';
import { PostgresModule } from 'src/postgres/postgres.module';

@Module({
  providers: [UsersService],
  controllers: [UserController],
  imports: [PostgresModule]
})
export class UsersModule {}
