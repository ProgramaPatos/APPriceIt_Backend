// store_id SERIAL NOT NULL PRIMARY KEY,
// store_name VARCHAR(172) NOT NULL,
// store_location geometry(Point,4326) NOT NULL,
// store_description TEXT NULL,
// store_schedule tstzrange NULL,
// store_creation_time timestamp NOT NULL,
// store_appuser_id int NULL REFERENCES appuser (appuser_id)

import { IsNotEmpty, IsString, IsNumber, Min, Max } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateStoreDTO {
  @IsString()
  @IsNotEmpty()
  readonly store_name: string;
  @IsNumber()
  @IsNotEmpty()
  readonly store_lon: number;
  @IsNumber()
  @IsNotEmpty()
  readonly store_lat: number;
  //TODO create a custom validator for this
  @IsString()
  readonly store_description: string;
  @IsString()
  readonly store_schedule: string;
  @IsNumber()
  @IsNotEmpty()
  readonly store_appuser_id: number;
}

export class UpdateStoreDTO extends PartialType(CreateStoreDTO) {}

export class StoreWithinDTO {
  @IsNumber()
  @IsNotEmpty()
  @Min(-90) // Latitudes are degrees in the range [-90,90]
  @Max(90)
  readonly lat: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(-180) // Longitudes are degrees in the range [-180,180]
  @Max(180)
  readonly lon: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  readonly distance: number;

}

export class StoreWithinNameDTO extends StoreWithinDTO {
  @IsString()
  @IsNotEmpty()
  readonly namePrefix: string;
}
