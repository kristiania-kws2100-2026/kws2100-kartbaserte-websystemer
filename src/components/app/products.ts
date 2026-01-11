export type ProductCategory = "fruits" | "vegetables";

export interface Product {
  category: ProductCategory;
  price: string;
  stocked: boolean;
  name: string;
}
