import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { classToPlain, instanceToPlain, plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import RefreshRequestDTO from 'src/auth/dtos/refresh-request.dto';
import SignInRequestDTO from 'src/auth/dtos/signin-request.dto';
import SignInResponseDTO from 'src/auth/dtos/signin-response.dto';
import TokenPayloadDTO from 'src/auth/dtos/token-payload.dto';
import { UsersService } from 'src/users/services/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}
    async signIn({ userName, password }: SignInRequestDTO): Promise<SignInResponseDTO> {
        const user = await this.usersService.findOne(userName);
        if (user?.appuser_password !== password || !user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload: TokenPayloadDTO = { userName: user.appuser_name, userEmail: user.appuser_email, userId: user.appuser_id };
        const tokens = {
            accessToken: await this.jwtService.signAsync(payload),
            refreshToken: await this.jwtService.signAsync(payload, { expiresIn: '7d' }),
        };
        /*await new Promise(resolve => setTimeout(resolve, 10000));
        console.log('access_token verify: ', this.jwtService.verify(token.access_token));
        console.log('refresh_token verify: ', this.jwtService.verify(token.refresh_token));*/
        await this.usersService.updateRefreshToken(user.appuser_id, tokens.refreshToken);
        return tokens;
    }

    async refresh({ refreshToken }: RefreshRequestDTO) {
        try {
            const payloadRaw = this.jwtService.verify(refreshToken);
            console.log("raw", payloadRaw);
            const payload = plainToInstance(TokenPayloadDTO, payloadRaw, { excludeExtraneousValues: true });

            console.log("pay", payload);
            await validate(payload);
            if (await this.usersService.getRefreshToken(payload.userEmail) !== refreshToken) {
                throw new Error('Invalid token');
            }
            return {
                accessToken: this.jwtService.sign(instanceToPlain(payload)),
            };
        } catch (error) {
            throw new UnauthorizedException(error.message);
        }
    }
}
