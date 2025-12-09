import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dtos/create-order.dto';
import { MomoService } from '../momo/momo.service';
import { SupabaseService } from '../supabase/supabase.service';
import { PaymentService } from '../payment/payment.service';
import { ShipmentService } from '../shipment/shipment.service';
import { OrderItemsService } from '../order-items/order-items.service';
import { OrderCouponService } from '../order-coupon/order-coupon.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly momoService: MomoService,
    private readonly paymentService: PaymentService,
    private readonly shipmentService: ShipmentService,
    private readonly orderItemService: OrderItemsService,
    private readonly orderCouponService: OrderCouponService,
  ) {}

  async getAllOrders(query: any) {
    const { page = 1, limit = 10, duration = 7 } = query;

    const offset = (page - 1) * limit;
    const from = offset;
    const to = offset + limit - 1;

    const { data, error, count } = await this.supabaseService.client
      .from('orders')
      .select('*', { count: 'exact' })
      .gte(
        'created_at',
        new Date(Date.now() - duration * 24 * 60 * 60 * 1000).toISOString(),
      )
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    return {
      statusCode: 200,
      message: 'Get all orders successfully',
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
        hasMore: to + 1 < (count ?? 0),
      },
    };
  }

  async createOrder(createOrder: CreateOrderDto) {
    const { totalAmount = 0, discount = 0, items, couponId } = createOrder;

    const shipment = await this.shipmentService.createShipment({
      fullName: 'Nguyen Van A',
      address:
        '123 Nguyen Van Linh, Ward 10, District 3, Ho Chi Minh City, Vietnam',
      email: 'Bt8Qz@example.com',
      phone: '0123456789',
      ward: 'Ward 10',
      district: 'District 3',
      province: 'Ho Chi Minh City',
      country: 'Vietnam',
    });

    const momoResponse = await this.momoService.createPayment(
      totalAmount.toString(),
    );

    const payment: any = await this.paymentService.createPayment({
      amount: 10000,
      userId: 2,
    });

    if (!payment) throw new Error('Payment not found');

    const { data: order, error } = await this.supabaseService.client
      .from('orders')
      .insert([
        {
          userId: 2,
          paymentId: payment.id,
          shipmentId: shipment.id,
          totalAmount,
          discount,
        },
      ])
      .select()
      .single();

    if (error) throw new Error(error.message);

    this.orderCouponService.createOrderCoupon({
      orderId: order.id,
      couponId: couponId,
    });

    Promise.all(
      createOrder.items.map((item) => {
        return this.orderItemService.createOrderItem({
          productVariantId: item.id,
          orderId: order.id,
          quantity: item.quantity,
          price: item.price,
        });
      }),
    );

    return {
      statusCode: 200,
      message: 'Create order successfully',
      data: {
        payURL: momoResponse.payUrl,
      },
    };
  }
}
