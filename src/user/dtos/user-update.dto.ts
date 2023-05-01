import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsEmail,
    Max,
    Min,
  } from 'class-validator';
  
  export default class UserUpdateDTO {
    /*
     * @example "Pato"
     */
    @IsOptional()
    @IsString()
    //@Min(3)
    //@Max(20)
    readonly appuser_name: string;

    /*
     * @example "secretos"
     */
    @IsOptional()
    @IsString()
    //@Min(7)
    //@Max(40)
    readonly appuser_password: string;
  }
  