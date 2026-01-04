export class Coupon {
  id: number;
  usageLimit: number;
  code: string;
  discountValue: number;
  discountType: 'percent' | 'fixed';
}
