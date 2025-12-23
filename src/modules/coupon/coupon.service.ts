import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CouponService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllCoupons(query: any) {}

  async getCouponById(id: number) {
    const { data: coupon, error } = await this.supabaseService.client
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);

    return {
      statusCode: 200,
      message: 'Get coupon successfully',
      data: coupon,
    };
  }

  async createCoupon(createCoupon: any) {
    const { data: newCoupon, error } = await this.supabaseService.client
      .from('coupons')
      .insert(createCoupon)
      .select('*');

    if (error) throw new Error(error.message);

    return {
      statusCode: 200,
      message: 'Create coupon successfully',
      data: newCoupon,
    };
  }
}
