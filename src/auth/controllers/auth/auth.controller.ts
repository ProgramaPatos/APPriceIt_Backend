import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { AuthGuard } from '../../guards/auth.guard';
import * as authModule from '../../auth.module';
import { Public } from '../../public.decorator';
/*import { Roles } from './roles.decorator';
import { Role } from './role.enum';
import { Public } from './auth.module';*/



@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('login')
    signIn(@Body() signInDto: Record<string, any>) {
        console.log('patitos');
        return this.authService.signIn(signInDto.username, signInDto.password);
    }

    @Post('refresh')
    async refresh(@Body('refresh_token') refreshToken: string) {
        console.log(refreshToken);
        return this.authService.refresh(refreshToken);
    }


    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

}

//pato