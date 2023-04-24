import { IsBoolean, IsOptional } from "class-validator";

export default class StoreProductsQueryDTO {
    /*
     * @example true
     */
    @IsBoolean()
    readonly withPrices: boolean;
}
