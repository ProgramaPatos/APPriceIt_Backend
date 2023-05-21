import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export default class StoreQueryDTO {
  /*
   * @example 4.636866196500524
   */
  @IsNumber()
  @IsNotEmpty()
  @Min(-90) // Latitudes are degrees in the range [-90,90]
  @Max(90)
  readonly lat: number;

  /*
   * @example -74.0835964893141
   */
  @IsNumber()
  @IsNotEmpty()
  @Min(-180) // Longitudes are degrees in the range [-180,180]
  @Max(180)
  readonly lon: number;

  /*
   * @example 1000
   */
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  readonly distance: number;

  /*
   * @example 0
   */
  // Put 0 as a default value to avoid having to check if it's undefined
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  readonly product_id: number;
}
