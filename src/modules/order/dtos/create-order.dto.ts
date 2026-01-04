export class CreateOrderDto {
  total: number;
  couponCode: string;
  items: any[];
  address: string;
  phone: string;
  provinceId: number;
  districtId: number;
  wardCode: string;
  name: string;
}
