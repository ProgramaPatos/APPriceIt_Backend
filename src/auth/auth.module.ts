import { Module, SetMetadata, CustomDecorator } from '@nestjs/common';
import { AuthController } from './controllers/auth/auth.controller';
import { AuthService } from './services/auth/auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from './guards/auth.guard';
import { APP_GUARD } from '@nestjs/core';
//import { RolesGuard } from './roles.guard';

//export const IS_PUBLIC_KEY = 'public';
//export const Public : () => CustomDecorator  = () => SetMetadata(IS_PUBLIC_KEY, true);

@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
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
      signOptions: { expiresIn: '1h' },
      verifyOptions: {}
    }),
  ],
  exports: [AuthService], 

})
export class AuthModule {}
