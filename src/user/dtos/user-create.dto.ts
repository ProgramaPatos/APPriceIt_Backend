import {
    IsNotEmpty,
    IsString,
    IsEmail,
    MaxLength,
    MinLength,
  } from 'class-validator';
  
  export default class UserCreateDTO {
    /*
     * @example "Pato"
     */
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(20)
    readonly appuser_name: string;
  
    /*
     * @example "pato@example.com"
     */
    @IsEmail()
    @IsNotEmpty()
    readonly appuser_email: string;
  
    /*
     * @example "secret"
     */
    @IsString()
    @IsNotEmpty()
    @MinLength(7)
    @MaxLength(40)
    readonly appuser_password: string;
  }
  