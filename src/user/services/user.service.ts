import { Injectable, Inject, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { IDatabase } from 'pg-promise';
import { IClient } from 'pg-promise/typescript/pg-subset';
import UserSearchDTO from '../dtos/user-search.dto';
import UserCreateDTO from '../dtos/user-create.dto';
import UserUpdateDTO from '../dtos/user-update.dto';
import * as bcrypt from 'bcrypt';


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
    const check = this.findOne(email);
    if(check != null){
      throw new UnprocessableEntityException('User with same email already exists');
    }else{
      return (await this.findOne(email)).appuser_refresh_token;
    }
    

  }
  //TODO: Add refresh token to user and email verification
  async createUser(newUser: UserCreateDTO) {
    //console.log(await bcrypt.hash(newUser.appuser_password, 12));
    const check = (await this.pgdb.func('fun.get_user', [
      newUser.appuser_email,
    ]));
    console.log(check)
    if(check[0]){
      throw new UnprocessableEntityException('User with same email already exists');
    }else{
      await this.pgdb.proc('fun.create_user', [
        newUser.appuser_name,
        await bcrypt.hash(newUser.appuser_password, 12),
        newUser.appuser_email,
        null
      ]);
      
    }
    
  }

  async updateUserInfo(id: number, updateUser: UserUpdateDTO) {
    //TODO:Validate data
    if (updateUser.appuser_name != null) {
      await this.pgdb.proc('fun.update_user_name', [
        id,
        updateUser.appuser_name
      ]);

    }
    if (updateUser.appuser_password != null) {
      await this.pgdb.proc('fun.update_user_password', [
        id,
        await bcrypt.hash(updateUser.appuser_password, 12),
      ]);
    }

  }

  async updateUserState(id: number, state: boolean) {
    //TODO:Validate data 
    const res = (await this.pgdb.func('fun.update_user_state', [
      id,
      state
    ]))[0].update_user_state;  
    console.log(res);
    if(res === -1){
      throw new NotFoundException(`User with id "${id}" does not exist`);
    }
  }

  async getMyStores(id:number){
    const res = await this.pgdb.func("fun.get_user_stores",[
      id
    ]);
    if(res.length == 0){
      throw new NotFoundException(`User with id "${id}" does not have stores`);
    }
    return res;
  }

  async getMyProducts(id:number){
    const res = await this.pgdb.func("fun.get_user_products", [
      id
    ]);
    if(res.length == 0){
      throw new NotFoundException(`User with id "${id}" does not have products`);
    }
    return res;
  }

  async getMyPrices(id:number){
    const res = await this.pgdb.func("fun.get_user_prices", [
      id
    ]);
    if(res.length == 0){
      throw new NotFoundException(`User with id "${id}" does not have prices`);
    }
    return res;
  }

  async getMyProductsAtStore(id:number){
    const res =  await this.pgdb.func("fun.get_user_productsatstore", [
      id
    ]);
    if(res.length == 0){
      throw new NotFoundException(`User with id "${id}" does not have products at stores`);
    }
    return res;
  }

}
