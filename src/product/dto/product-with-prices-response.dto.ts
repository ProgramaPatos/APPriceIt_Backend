import { Type } from "class-transformer";
import { IsArray, IsObject, ValidateNested } from "class-validator";
import PriceResponseDto from "./price.dto";
import ProductResponseDTO from "./product-response.dto";

export default class ProductWithPricesResponseDTO extends ProductResponseDTO {
    @IsObject()
    @Type(() => PriceResponseDto)
    @IsArray()
    @ValidateNested()
    readonly prices: PriceResponseDto[];
}
