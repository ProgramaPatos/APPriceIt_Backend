import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, Session, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SessionData } from 'express-session';
import { Request } from 'express';


@Controller('auth')
export class AuthController {
    @SetMetadata('isPublic', true)
    @UseGuards(AuthGuard('local'))
    @HttpCode(HttpStatus.OK)
    @Post('/login')
    login(@Req() req: Request, @Session() session: SessionData) {
        session.user = {
        userId: req.user.userId,
        username: req.user.username,
        userEmail: req.user.userEmail,
        roles: req.user.roles
        };
        console.log('prueba');
        return {
        status: HttpStatus.OK
        };
    }

    @HttpCode(HttpStatus.NO_CONTENT)
    @Post('/logout')
    logout(@Req() req: Request) {
        return new Promise((resolve, reject) => {
        req.session.destroy((err) => {
            if (err) reject(err);
            resolve({
            status: 204,
            message: 'Session destroyed'
            });
        });
        });
    }
}
