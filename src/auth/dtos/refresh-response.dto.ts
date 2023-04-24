import { IsJWT } from "class-validator";

export default class RefreshResponseDTO {
    @IsJWT()
    accessToken: string;
}
