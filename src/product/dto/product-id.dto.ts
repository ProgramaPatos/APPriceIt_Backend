import { IsNumber, IsOptional } from "class-validator";

export default class ProductIdResponseDto {
    @IsNumber()
    @IsOptional()
    readonly product_id: number;
}