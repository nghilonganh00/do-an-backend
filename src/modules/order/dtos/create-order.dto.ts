export class CreateOrderDto {
  userId: number;
  total: number;
  discount: number;
  couponId: number;
  items: any[];
  address: string;
  country: string;
  email: string;
  phone: string;
  provinceId: number;
  districtId: number;
  wardCode: number;
  name: string;
}
