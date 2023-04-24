import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}
    //trostes
    //funcionaa :(
    async signIn(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (user?.appuser_password !== pass || !user) {
        throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { username: user.appuser_name, email:user.appuser_email, sub: user.appuser_id };
        const token =  {
            access_token: await this.jwtService.signAsync(payload),
            refresh_token: await this.jwtService.signAsync(payload, {expiresIn: '7d'}),
        };
        /*await new Promise(resolve => setTimeout(resolve, 10000));
        console.log('access_token verify: ', this.jwtService.verify(token.access_token));
        console.log('refresh_token verify: ', this.jwtService.verify(token.refresh_token));*/
        await this.usersService.updateRefreshToken(user.appuser_email, token.refresh_token);
        return token;
    }

    async refresh(token: string) {
        try {
          const payload = this.jwtService.verify(token) as any;
          if(await this.usersService.getRefreshToken(payload.email) !== token){
            throw new Error('Invalid token');
          }
          return {
            access_token: this.jwtService.sign({user: payload.user}),
          };
        } catch (error) {
          throw new UnauthorizedException(error.message);
        }
    }
}
