import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseService } from '../supabase/supabase.service';
import { Order } from '../order/types';
import { GhnService } from '../ghn/ghn.service';
import { OrderService } from '../order/order.service';

@Injectable()
export class TasksService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly ghnService: GhnService,
    private readonly orderService: OrderService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleUpdateStatusOrder() {
    const { data } = await this.supabaseService.client
      .from('orders')
      .select('*')
      .neq('status', 'delivered');

    if (!data) return;

    const orders = data as Order[];

    for (const order of orders) {
      const { status } = await this.ghnService.getOrderInfo(order.code);
      await this.orderService.updateStatus(order.id, status);
    }
  }
}
