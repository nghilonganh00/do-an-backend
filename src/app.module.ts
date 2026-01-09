import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GhnModule } from './modules/ghn/ghn.module';
import { MomoModule } from './modules/momo/momo.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { OrderModule } from './modules/order/order.module';
import { PaymentModule } from './modules/payment/payment.module';
import { ShipmentModule } from './modules/shipment/shipment.module';
import { OrderItemsModule } from './modules/order-items/order-items.module';
import { OrderCouponModule } from './modules/order-coupon/order-coupon.module';
import { ProductModule } from './modules/product/product.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { ChatbotModule } from './modules/chatbot/chatbot.module';
import { AuthModule } from './modules/auth/auth.module';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './modules/tasks/tasks.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { RedisModule } from './modules/redis/redis.module';
import { CacheModule } from './modules/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule,
    CacheModule,
    ScheduleModule.forRoot(),
    TasksModule,
    SupabaseModule,
    AuthModule,
    GhnModule,
    MomoModule,
    PaymentModule,
    ShipmentModule,
    OrderModule,
    OrderItemsModule,
    OrderCouponModule,
    ProductModule,
    CouponModule,
    ChatbotModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
