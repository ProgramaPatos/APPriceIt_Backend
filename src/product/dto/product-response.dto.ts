import { Type } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import PriceResponseDto from './price.dto';

export default class ProductResponseDTO {
    /*
     * @example 7974
     */
    @IsNumber()
    @IsNotEmpty()
    readonly product_id: number;

    /*
     * @example "Yogurt"
     */
    @IsString()
    @IsNotEmpty()
    readonly product_name: string;

    /*
     * @example "descripcion"
     */
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly product_description?: string;

    /*
     * @example  "2023-04-21T20:14:01.539Z"
     */
    @IsString()
    @IsNotEmpty()
    readonly product_creation_time: string;

    /*
     * @example 1
     */
    @IsNumber()
    @IsNotEmpty()
    readonly product_appuser_id: number;
}
