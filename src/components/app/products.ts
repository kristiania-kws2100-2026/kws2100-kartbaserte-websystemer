export type ProductCategory = "fruits" | "vegetables" | "snacks";

export interface Product {
  category: ProductCategory;
  price: string;
  stocked: boolean;
  name: string;
}
