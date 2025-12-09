import { Body, Controller, Post } from '@nestjs/common';
import { CouponService } from './coupon.service';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  async createCoupon(@Body() body: any) {
    return this.couponService.createCoupon(body);
  }
}
