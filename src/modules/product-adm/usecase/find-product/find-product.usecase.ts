import ProductGateway from "../../gateway/product.gateway";
import { FindProductAdmInputDto, FindProductAdmOutputDto } from "./find-product.dto";

export default class FindProductAdmUseCase {
  constructor(private repository: ProductGateway) {}

  async execute(input: FindProductAdmInputDto): Promise<FindProductAdmOutputDto> {
    const product = await this.repository.find(input.id);
    if (!product) {
      throw new Error("Product not found");
    }
    return {
      id: product.id.id,
      name: product.name,
      description: product.description,
      purchasePrice: product.purchasePrice,
      stock: product.stock,
    };
  }
}

