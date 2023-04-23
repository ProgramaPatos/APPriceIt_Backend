import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsString,
  } from 'class-validator';
  
  export default class UserQueryDTO {
    /*
     * @example B
     */
    @IsString()
    @IsNotEmpty()
    readonly name_prefix: string;

    @IsString()
    @IsNotEmpty()
    readonly password: string;

    @IsString()
    @IsNotEmpty()
    readonly creation_date: string;

    @IsBoolean()
    @IsNotEmpty()
    readonly state: boolean;

    @IsString()
    @IsNotEmpty()
    readonly email: string;

    @IsInt()
    @IsNotEmpty()
    readonly role: number;

  }
  