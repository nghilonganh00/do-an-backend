import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class CouponService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllCoupons(query: any) {}

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
