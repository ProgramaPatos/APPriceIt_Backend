import { ApiProperty } from '@nestjs/swagger';
import { IsJSON, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Point } from 'geojson';


export default class StoreResponseDTO {

    /*
     * @example 7974
     */
    @IsNumber()
    @IsNotEmpty()
    store_id: number;

    /*
     * @example "Hemeroteca Nacional"
     */
    @IsString()
    @IsNotEmpty()
    store_name: string;

    /*
     * A GeoJSON point
     */
    @IsJSON()
    @IsNotEmpty()
    @ApiProperty({
        example: {
            "type": "Point",
            "coordinates": [
                -74.091117035,
                4.63663201
            ]
        },
        type: "GeoJSON.Point"
    })
    store_location: Point;

    /*
     * @example "Repositorio de revistas de la UN"
     */
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    store_description?: string;

    /*
     *
     */
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    store_schedule?: string;

    /*
     * @example  "2023-04-21T20:14:01.539Z"
     */
    @IsString()
    @IsNotEmpty()
    store_creation_time: string;

    /*
     * @example 1
     */
    @IsNumber()
    @IsNotEmpty()
    store_appuser_id: number;
}
