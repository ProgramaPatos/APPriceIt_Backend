import { IsAlphanumeric, IsEmail, IsNotEmpty, IsString } from "class-validator";

export default class SignInRequestDTO {
    /*
     * @example "user@mail.com"
     */
    @IsString()
    @IsNotEmpty()
    readonly userName: string;

    /*
     * @example "user"
     */
    @IsAlphanumeric()
    @IsNotEmpty()
    readonly password: string;
}
