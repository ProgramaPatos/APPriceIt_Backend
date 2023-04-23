import { Body, Controller, Get, Post, Session } from '@nestjs/common';
import { SessionData } from 'express-session';
import { UseRoles } from 'nest-access-control';
import { UsersService } from '../services/users.service';

@Controller('user')
export class UserController {
  constructor(private userService: UsersService) {}
  @Get('me')
  getMe(@Session() session: SessionData) {
    return this.userService.getMe(session.user.userEmail);
  }

  /*@UseRoles({
    resource: 'employeeData',
    action: 'update',
    possession: 'any'
  })
  @Post('promote')
  promoteUserToManager(@Body('employeeId') employeeId: number) {
    return this.userService.promoteUserToManager(employeeId);
  }*/

}