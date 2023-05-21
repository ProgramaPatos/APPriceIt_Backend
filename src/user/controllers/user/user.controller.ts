import { Controller, Get, UseGuards, Request, Response, Param,ParseIntPipe ,ParseBoolPipe, Put, Post, Body } from '@nestjs/common';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/public.decorator';
import UserCreateDTO from 'src/user/dtos/user-create.dto';
import { userService } from 'src/user/services/user.service';
import { ApiNoContentResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import UserUpdateDTO from 'src/user/dtos/user-update.dto';
import { ACGuard, UseRoles, UserRoles } from 'nest-access-control';

@ApiBearerAuth()
@ApiTags('user')
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
    /*
     * Endpoint to update user state
     */
    //@UseGuards(AuthGuard)
    @Put(':userId/:state')
    @UseGuards(ACGuard)
    @UseRoles({
        possession: 'any',
        action: 'update',
        resource: 'user-state'
    })
    updateState(@Param('userId', ParseIntPipe) userId: number, @Param('state', ParseBoolPipe)state: boolean) {
        //check authorization
        this.userService.updateUserState(userId, state);
    }
}
