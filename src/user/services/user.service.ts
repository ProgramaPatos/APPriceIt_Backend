import { Injectable, Inject, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { IDatabase } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import UserSearchDTO from '../dtos/user-search.dto';
import UserCreateDTO from '../dtos/user-create.dto';
import * as bcrypt from 'bcrypt';

export type User = any;

@Injectable()
export class userService {
  // private readonly users = [
  //     {
  //       userId: 1,
  //       username: 'john',
  //       password: 'changeme',
  //       creation: '',
  //       state: true,
  //       refreshToken: null,
  //     },
  //     {
  //       userId: 2,
  //       username: 'maria',
  //       password: 'guess',
  //       creation: '',
  //       state: true,
  //       refreshToken: null,
  //     },
  //   ];
  constructor(
    @Inject('POSTGRES_PROVIDER')
    private pgdb: IDatabase<{}, IClient>,
  ) {}

  async findOne(email: string): Promise<UserSearchDTO> {
    const res = (await this.pgdb.func('fun.get_user', [
      email,
    ])) as UserSearchDTO[];
    if (res.length == 0) {
      throw new NotFoundException(`User with email "${email}" does not exist`);
    } else if (res.length > 1) {
      throw new UnprocessableEntityException('Multiple users with same email found');
    }
    return res[0];
  }

  async updateRefreshToken(id: number, newRefreshToken: string) {
    //TODO:Validate data
    await this.pgdb.proc('fun.update_user_refresh_token', [
      id,
      newRefreshToken,
    ]);
  }

  async getRefreshToken(email: string) {
    return (await this.findOne(email)).appuser_refresh_token;

  }
  //TODO: Add refresh token to user and email verification
  async createUser(newUser: UserCreateDTO) {
    await this.pgdb.proc('fun.create_user', [
      newUser.appuser_name,
      await bcrypt.hash(newUser.appuser_password,12),
      newUser.appuser_email,
      null
    ]);
  }
}
