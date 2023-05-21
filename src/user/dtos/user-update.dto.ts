import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsEmail,
    MaxLength,
    MinLength,
  } from 'class-validator';
  
  export default class UserUpdateDTO {
    /*
     * @example "Pato"
     */
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(40)
    readonly appuser_name: string;

    /*
     * @example "secretos"
     */
    @IsOptional()
    @IsString()
    @MinLength(7)
    @MaxLength(40)
    readonly appuser_password: string;
  }
  