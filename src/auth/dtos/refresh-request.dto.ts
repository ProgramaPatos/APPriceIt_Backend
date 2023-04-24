import { IsJWT } from "class-validator";


export default class RefreshRequestDTO {
    @IsJWT()
    readonly refreshToken: string;
}
