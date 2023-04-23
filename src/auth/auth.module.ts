import { Module, SetMetadata } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
//import { RolesGuard } from './roles.guard';

/*export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);*/

@Module({
  controllers: [AuthController],
  providers: [
    /*{
      provide: APP_GUARD,
      useClass: AuthGuard,
    },*/
    /*{
      provide: APP_GUARD,
      useClass: RolesGuard,
    },*/
    AuthService
  ],
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: 'cuaaack',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  exports: [AuthService], 

})
export class AuthModule {}
