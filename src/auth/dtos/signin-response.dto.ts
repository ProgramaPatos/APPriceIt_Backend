import { IsJWT } from "class-validator";

export default class SignInResponseDTO {
    @IsJWT()
    readonly accessToken: string;
    @IsJWT()
    readonly refreshToken: string;
}
