import { Controller, Get, UseGuards, Request, Response, Put, Post, Body } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/public.decorator';
import UserCreateDTO from 'src/user/dtos/user-create.dto';
import { userService } from 'src/user/services/user.service';
import { ApiNoContentResponse } from '@nestjs/swagger';
import UserUpdateDTO from 'src/user/dtos/user-update.dto';
import { ACGuard, UseRoles, UserRoles } from 'nest-access-control';

@Controller('user')
export class UserController {
    constructor(private userService: userService) {}
    /*
     * Endpoint to get user profile
     */
    //@UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return this.userService.findOne(req.user.userEmail);
    }

    /*
     * Endpoint to update user profile
     */
    //@UseGuards(AuthGuard)
    @Put('profile')
    @UseGuards(ACGuard)
    @UseRoles({
        possession: 'any',
        action: 'update',
        resource: 'user-state'
    })
    updateProfile(@Request() req, @Body() body: UserUpdateDTO) {
        //check authorization
        this.userService.updateUserInfo(req.user.userId, body);
    }

    /*
     * Endpoint to add user profile
     */
    @ApiNoContentResponse({ description: 'User created.' })
    @Public()
    @Post('signUp')//
    signUp(@Body() body: UserCreateDTO): void {
        this.userService.createUser(body);
        //console.log(body);
    }
}
