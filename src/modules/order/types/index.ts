export interface Order {
  id: number;
  code: string;
  product: string;
  quantity: number;
  price: number;
  status: 'pending' | 'paid' | 'cancelled';
}

export interface OrderResponse {
  order_id: string | number;
  shipment_id: string | number;
  payment_id: number;
}
