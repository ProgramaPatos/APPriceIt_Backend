import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsEmail,
    Max,
    Min,
  } from 'class-validator';
  
  export default class UserCreateDTO {
    /*
     * @example "Pato"
     */
    @IsString()
    @IsNotEmpty()
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
    readonly appuser_password: string;
  }
  