import StoreCreateDTO from "./store-create.dto";
import { PartialType } from "@nestjs/swagger";
export default class StoreUpdateDTO extends PartialType(StoreCreateDTO) {}
