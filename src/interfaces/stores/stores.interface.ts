import { GeoJSON } from "geojson";


export interface Store {
  store_id: number;
  store_name: string;
  store_location: GeoJSON;
  store_description: string;
  store_schedule: string;
  store_creation_time: string;
  store_appuser_id: number;
}
