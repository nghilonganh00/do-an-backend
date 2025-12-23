import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class OrderCouponService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createOrderCoupon({
    orderId,
    couponId,
    discountAmount,
  }: {
    orderId: number;
    couponId: number;
    discountAmount: number;
  }) {
    const { data, error } = await this.supabaseService.client
      .from('orderCoupons')
      .insert({
        orderId: orderId,
        couponId: couponId,
        discountAmount,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }
}
