import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { IDatabase } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import UserQueryDTO from '../dtos/user-query.dto';

export type User = any;

@Injectable()
export class UsersService {
  constructor(
    @Inject('POSTGRES_PROVIDER')
    private pgdb: IDatabase<{}, IClient>,
  ) {}

  async getMe(email: string): Promise<UserQueryDTO> {
    const res = (await this.pgdb.func('fun.get_user', [
      email,
    ])) as UserQueryDTO[];
    if (res.length == 0) {
      throw new NotFoundException(`User with email "${email}" does not exist`);
    } else if (res.length > 1) {
      throw new UnprocessableEntityException(
        `Multiple users with ${email} found`,
      );
    }
    return res[0];
  }

  async createUser(newUser: UserQueryDTO) {
    await this.pgdb.proc('fun.create_user', [
      newUser.name_prefix,
      newUser.password,
      newUser.creation_date,
      newUser.state,
      newUser.email,
      newUser.role,
    ]);
  }

  //TO DO: funcion asignar roles
    
}
