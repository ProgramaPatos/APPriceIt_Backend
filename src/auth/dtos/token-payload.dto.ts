import { Expose } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsString } from "class-validator";
import { Role } from "src/user/role/role.enum";

export default class TokenPayloadDTO {
    @Expose()
    @IsString()
    @IsNotEmpty()
    readonly userName: string;

    @Expose()
    @IsEmail()
    readonly userEmail: string;

    @Expose()
    @IsInt()
    readonly userId: number;

    @Expose()
    @IsNotEmpty()
    readonly roles: Role;
}
