import { Injectable } from '@nestjs/common';

export type User = any;

@Injectable()
export class UsersService {
    private readonly users = [
        {
          userId: 1,
          username: 'john',
          password: 'changeme',
          creation: '',
          state: true,
          refreshToken: null,
        },
        {
          userId: 2,
          username: 'maria',
          password: 'guess',
          creation: '',
          state: true,
          refreshToken: null,
        },
      ];
    
      async findOne(username: string): Promise<User | undefined> {
        return this.users.find(user => user.username === username);
      }

      async updateRefreshToken(username:string, newRefreshToken: string){
        this.users.find(user => user.username === username).refreshToken = newRefreshToken;

      }

      async getRefreshToken(username:string){
        return this.users.find(user => user.username === username).refreshToken;

      }
    
}
