import { PartialType } from "@nestjs/swagger";
import ProductCreateDTO from "./product-create.dto";

export class ProductUpdateDTO extends PartialType(ProductCreateDTO) {}
