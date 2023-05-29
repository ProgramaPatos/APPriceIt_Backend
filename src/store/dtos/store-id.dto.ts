import { IsNumber, IsNotEmpty } from "class-validator";

export default class StoreIdResponseDTO {
    @IsNumber()
    @IsNotEmpty()
    readonly store_id: number;
}