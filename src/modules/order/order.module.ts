import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MomoModule } from '../momo/momo.module';
import { PaymentService } from '../payment/payment.service';
import { ShipmentService } from '../shipment/shipment.service';
import { OrderItemsService } from '../order-items/order-items.service';
import { OrderCouponService } from '../order-coupon/order-coupon.service';

@Module({
  imports: [MomoModule],
  providers: [
    OrderService,
    PaymentService,
    ShipmentService,
    OrderItemsService,
    OrderCouponService,
  ],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
