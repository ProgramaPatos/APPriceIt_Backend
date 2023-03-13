// store_id SERIAL NOT NULL PRIMARY KEY,
// store_name VARCHAR(172) NOT NULL,
// store_location geometry(Point,4326) NOT NULL,
// store_description TEXT NULL,
// store_schedule tstzrange NULL,
// store_creation_time timestamp NOT NULL,
// store_appuser_id int NULL REFERENCES appuser (appuser_id)

import { IsNotEmpty, IsString, IsNumber, IsDate } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateStoreDTO {
  store_id: number;
  @IsString()
  @IsNotEmpty()
  readonly store_name: string;
  @IsNotEmpty()
  readonly store_location: string;
  //TODO create a custom validator for this
  @IsString()
  @IsNotEmpty()
  readonly store_description: string;
  @IsString()
  @IsNotEmpty()
  readonly store_schedule: string;
  @IsDate()
  readonly store_creation_time: string;
  @IsNumber()
  readonly store_appuser_id: number;
}

export class UpdateStoreDTO extends PartialType(CreateStoreDTO) {}
