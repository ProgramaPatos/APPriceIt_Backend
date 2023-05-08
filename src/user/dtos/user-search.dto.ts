import {
    IsNotEmpty,
    IsBoolean,
    IsString,
    IsOptional,
    IsNumber,
    IsDate,
    IsEmail,
  } from 'class-validator';
import { Role } from '../role/role.enum';
  
  // TODO: unify coordinate validation under a DTO or custom validator
  export default class UserSearchDTO {

    /*
     * @example "1"
     */
    @IsNumber()
    @IsNotEmpty()
    readonly appuser_id: number;

    /*
     * @example "Admin"
     */
    @IsString()
    @IsNotEmpty()
    readonly appuser_name: string;
  
    /*
     * @example "hashedpassword"
     */
    @IsString()
    @IsNotEmpty()
    readonly appuser_password: string;

    /*
     * @example ""
     */
    @IsDate()
    @IsNotEmpty()
    readonly appuser_creation_date: string;

    /*
     * @example "patos@gmail.com"
     */
    @IsEmail()
    @IsNotEmpty()
    readonly appuser_email: string;

    /*
     * @example "Admin"
     */
    @IsNotEmpty()
    readonly appuser_role: Role;

    /*
     * @example "true"
     */
    @IsBoolean()
    @IsNotEmpty()
    readonly appuser_state: boolean;

    /*
     * @example "null"
     */
    @IsString()
    @IsOptional()
    readonly appuser_refresh_token: string;
    
  }
  