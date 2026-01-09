import { Product } from './product.entity';

export interface ProductVariant {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  product: Product;
  stock: number;
}
