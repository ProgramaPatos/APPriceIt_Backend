import { Controller, Get, UseGuards, Request, Response, Put, Post, Body } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/public.decorator';
import UserCreateDTO from 'src/user/dtos/user-create.dto';
import { userService } from 'src/user/services/user.service';
import { ApiNoContentResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
    constructor(private userService: userService) {}
    /*
     * Endpoint to get user profile
     */
    //@UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    /*
     * Endpoint to update user profile
     */
    //@UseGuards(AuthGuard)
    @Put('profile')
    updateProfile(@Request() req, @Response() res) {
        return req.user;
    }

    /*
     * Endpoint to add user profile
     */
    @ApiNoContentResponse({ description: 'User created.' })
    @Public()
    @Post('signUp')//
    signUp(@Body() body: UserCreateDTO): void {
        this.userService.createUser(body);
        console.log(body);
    }
}
