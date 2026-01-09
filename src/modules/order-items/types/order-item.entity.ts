import { ProductVariant } from 'src/modules/product/types/product-variant.entity';

export interface OrderItem {
  id: number;
  quantity: number;
  productVariantId: number;
  orderId: number;
  productVariant: ProductVariant;
}
