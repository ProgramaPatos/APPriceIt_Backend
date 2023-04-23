import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StoreModule } from './store/store.module';
import { PostgresModule } from './postgres/postgres.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

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
  ],
})
export class AppModule {}
