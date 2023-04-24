import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";


export default class ProductCreateDTO {

    /*
     * @example "Yogurt"
     */
    @IsString()
    @IsNotEmpty()
    readonly product_name: string;

    /*
     * @example "Delicioso yogurt"
     */
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    readonly product_description?: string;

    /*
     * @example 1
     */
    @IsInt()
    @IsNotEmpty()
    readonly product_appuser_id: number;

}
