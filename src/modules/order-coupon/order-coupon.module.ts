import { Module } from '@nestjs/common';
import { OrderCouponController } from './order-coupon.controller';
import { OrderCouponService } from './order-coupon.service';

@Module({
  controllers: [OrderCouponController],
  providers: [OrderCouponService]
})
export class OrderCouponModule {}
