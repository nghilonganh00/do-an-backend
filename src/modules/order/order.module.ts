import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { MomoModule } from '../momo/momo.module';
import { PaymentService } from '../payment/payment.service';
import { ShipmentService } from '../shipment/shipment.service';
import { OrderItemsService } from '../order-items/order-items.service';
import { OrderCouponService } from '../order-coupon/order-coupon.service';
import { GhnService } from '../ghn/ghn.service';
import { GhnModule } from '../ghn/ghn.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [GhnModule, HttpModule, MomoModule],
  providers: [
    OrderService,
    PaymentService,
    ShipmentService,
    OrderItemsService,
    OrderCouponService,
    GhnService,
  ],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
