interface Order {
  id: string;
  product: string;
  quantity: number;
  price: number;
  status: 'pending' | 'paid' | 'cancelled';
}
