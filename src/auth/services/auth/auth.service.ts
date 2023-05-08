import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { classToPlain, instanceToPlain, plainToClass, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import RefreshRequestDTO from 'src/auth/dtos/refresh-request.dto';
import SignInRequestDTO from 'src/auth/dtos/signin-request.dto';
import SignInResponseDTO from 'src/auth/dtos/signin-response.dto';
import TokenPayloadDTO from 'src/auth/dtos/token-payload.dto';
import { userService } from 'src/user/services/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: userService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}
    async signIn({ userName, password }: SignInRequestDTO): Promise<SignInResponseDTO> {
        const user = await this.usersService.findOne(userName);
        //console.log(user.appuser_password);
        //console.log(await bcrypt.compare(password, user.appuser_password));
        if (!user || !await bcrypt.compare(password, user.appuser_password)) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload: TokenPayloadDTO = { userName: user.appuser_name, userEmail: user.appuser_email, userId: user.appuser_id, roles: user.appuser_role };
        const tokens = {
            accessToken: await this.jwtService.signAsync(payload),
            refreshToken: await this.jwtService.signAsync(payload, { expiresIn: this.configService.get("JWT_REFRESH_EXPIRATION_TIME") }),
        };
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

    async logOut(id: number){
        await this.usersService.updateRefreshToken(id, "");

    }
}
