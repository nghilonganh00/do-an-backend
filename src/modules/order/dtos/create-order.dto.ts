export class CreateOrderDto {
  userId: number;
  totalAmount: number;
  discount: number;
  couponId: number;
  items: any[];
}
