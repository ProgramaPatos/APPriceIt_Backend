import { Body, Controller, Get, HttpCode, HttpStatus, Post, Put, Response, Request, UseGuards, SetMetadata, Query } from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { AuthGuard } from '../../guards/auth.guard';
import { Public } from '../../public.decorator';
import SignInResponseDTO from 'src/auth/dtos/signin-response.dto';
import RefreshRequestDTO from 'src/auth/dtos/refresh-request.dto';
import SignInRequestDTO from 'src/auth/dtos/signin-request.dto';
import { ApiTags } from '@nestjs/swagger';
/*import { Roles } from './roles.decorator';
import { Role } from './role.enum';
import { Public } from './auth.module';*/



@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    /*
     * Login endpoint, use credentials to get access and refresh token
     */
    @HttpCode(HttpStatus.OK)
    @Public()
    @Post('login')
    signIn(@Body() signInRequest: SignInRequestDTO): Promise<SignInResponseDTO> {
        return this.authService.signIn(signInRequest);
    }

    @Put('logout')
    logOut(@Request() req){
        this.authService.logOut(req.user.userId);

    }

    /*
     * Endpoint to get a new access token fron an access one.
     */
    @Post('refresh')
    async refresh(@Body() refreshToken: RefreshRequestDTO) {
        console.log(refreshToken);
        return this.authService.refresh(refreshToken);
    }


    /*
     * Test endpoint. TODO: Remove
     */
    @UseGuards(AuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

}

//pato
