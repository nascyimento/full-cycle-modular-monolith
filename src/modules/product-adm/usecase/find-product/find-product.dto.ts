export interface FindProductAdmInputDto {
  id: string;
}

export interface FindProductAdmOutputDto {
  id: string;
  name: string;
  description: string;
  purchasePrice: number;
  stock: number;
}

