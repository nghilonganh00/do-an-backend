import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CouponService } from './coupon.service';

@Controller('coupons')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Get(':id')
  async getCouponById(@Param('id') id: number) {
    return this.couponService.getCouponById(id);
  }

  @Post()
  async createCoupon(@Body() body: any) {
    return this.couponService.createCoupon(body);
  }
}