import { Module} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { PostgresModule } from 'src/postgres/postgres.module';


@Module({
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy],
  imports: [PostgresModule]
})
export class AuthModule {}
