import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StoreModule } from './store/store.module';
import { PostgresModule } from './postgres/postgres.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ACGuard, AccessControlModule } from 'nest-access-control';
import { APP_GUARD } from '@nestjs/core';
import { SessionGuard } from './auth/session.guard';
import { RBAC_POLICY } from './auth/rbac-policy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
    }),
    StoreModule,
    PostgresModule,
    AuthModule,
    UsersModule,
    AccessControlModule.forRoles(RBAC_POLICY),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: SessionGuard
    },
    {
      provide: APP_GUARD,
      useClass: ACGuard
    }
  ]
})
export class AppModule {}
