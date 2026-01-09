import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Coupon } from './types/coupon.entity';

@Injectable()
export class CouponService {
  constructor(private readonly supabaseService: SupabaseService) {}

  // async getAllCoupons(query: QueryParams) {}

  async getCouponById(id: number) {
    const { data: coupon, error } = await this.supabaseService.client
      .from('coupons')
      .select('*')
      .eq('id', id)
      .single<Coupon>();

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

  async getDiscount({
    userId,
    couponCode,
    amount,
  }: {
    userId: number;
    couponCode: string;
    amount: number;
  }): Promise<{ couponId: number; discount: number }> {
    try {
      const { data: coupon, error: couponError } =
        await this.supabaseService.client
          .from('coupons')
          .select('*')
          .eq('code', couponCode)
          .single<Coupon>();

      if (couponError) throw new Error(couponError.message);

      const { data: orderCoupon, error: orderCouponError } =
        await this.supabaseService.client
          .from('orderCoupons')
          .select('*, order:orders(*)')
          .eq('couponId', coupon.id)
          .eq('order.userId', userId);

      if (orderCouponError) throw new Error(orderCouponError.message);

      if (orderCoupon.length >= coupon.usageLimit) {
        throw new Error('Coupon already used');
      }

      if (coupon.discountType === 'percent') {
        return {
          couponId: coupon.id,
          discount: amount * coupon.discountValue,
        };
      }

      return {
        couponId: coupon.id,
        discount: coupon.discountValue,
      };
    } catch (error) {
      console.error(error);

      const errorMessage =
        error instanceof Error ? error.message : 'Coupon error';

      throw new Error(errorMessage);
    }
  }
}
