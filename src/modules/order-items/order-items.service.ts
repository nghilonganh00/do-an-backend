import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class OrderItemsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createOrderItem({
    productVariantId,
    orderId,
    quantity,
    price,
  }: {
    productVariantId: number;
    orderId: number;
    quantity: number;
    price: number;
  }) {
    const { data, error } = await this.supabaseService.client
      .from('orderItems')
      .insert({
        productVariantId: productVariantId,
        orderId: orderId,
        quantity,
        price,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }
}
