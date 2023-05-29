import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// TODO: unify coordinate validation under a DTO or custom validator
export default class StoreCreateDTO {
  /*
   * @example "Patotienda"
   */
  @IsString()
  @IsNotEmpty()
  readonly store_name: string;

  /*
   * @example 4.636866196500524
   */
  @IsNumber()
  @IsNotEmpty()
  @Min(-90) // Latitudes are degrees in the range [-90,90]
  @Max(90)
  readonly store_lat: number;

  /*
   * @example -74.0835964893141
   */
  @IsNumber()
  @IsNotEmpty()
  @Min(-180) // Longitudes are degrees in the range [-180,180]
  @Max(180)
  readonly store_lon: number;

  /*
   * @example "Acá se venden plumas que flotan"
   */
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  readonly store_description: string;

  /*
   * @example "[1970-01-01 9:00, 1970-01-01 18:00]"
   */
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly store_schedule?: string;

  
}
