import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role } from './role.enum';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Credentials incorrect');
    }

    const userIsAdmin = user.departmentsLink.some(
      (link) => link.role === Role.Admin
    );
    const userIsModerator = user.departmentsLink.some(
      (link) => link.role === Role.Mod
    );

    let userRole = Role.User;
    if (userIsModerator) userRole = Role.Mod;
    if (userIsAdmin) userRole = Role.Admin;

    return {
      userId: user.id,
      username: user.username,
      roles: [userRole]
    };
  }
}