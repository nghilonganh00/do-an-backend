import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class OrderCouponService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createOrderCoupon({
    orderId,
    couponId,
  }: {
    orderId: number;
    couponId: number;
  }) {
    const { data, error } = await this.supabaseService.client
      .from('orderCoupons')
      .insert({
        orderId: orderId,
        couponId: couponId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }
}
