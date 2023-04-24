import { IsInt, IsNumber, IsPositive, IsString } from "class-validator";

export default class PriceResponseDto {

    @IsInt()
    readonly price_id: number;

    @IsNumber()
    readonly price_value: number;

    @IsString()
    readonly price_creation_time: string;

    @IsInt()
    readonly price_appuser_id: number;
}
