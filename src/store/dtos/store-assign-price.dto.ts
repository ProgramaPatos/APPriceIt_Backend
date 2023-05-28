import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Max,
    Min,
  } from 'class-validator';
  
  // TODO: unify coordinate validation under a DTO or custom validator
  export default class StoreAssignPriceDTO {
    

    /*
    * @example 1
    */
    @IsNumber()
    @Min(0)
    readonly product_price: number;

  }
  