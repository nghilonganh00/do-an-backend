import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dtos/create-order.dto';
import { MomoService } from '../momo/momo.service';
import { SupabaseService } from '../supabase/supabase.service';
import { PaymentService } from '../payment/payment.service';
import { OrderItemsService } from '../order-items/order-items.service';
import { OrderCouponService } from '../order-coupon/order-coupon.service';
import { GhnService } from '../ghn/ghn.service';
import { Order, OrderResponse } from './types';
import { CreateGHNOrder } from '../ghn/types/ghn-province.interface';
import { OrderQueryParams } from './types/queryParams';
import { CouponService } from '../coupon/coupon.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly momoService: MomoService,
    private readonly ghnService: GhnService,
    private readonly paymentService: PaymentService,
    private readonly orderItemService: OrderItemsService,
    private readonly orderCouponService: OrderCouponService,
    private readonly couponService: CouponService,
  ) {}

  async getAllOrders(query: OrderQueryParams) {
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

  async createOrder(userId: number, createOrder: CreateOrderDto) {
    try {
      const {
        total = 0,
        items,
        couponCode,
        address,
        phone,
        provinceId,
        districtId,
        wardCode,
        name,
      } = createOrder;

      const { discount } = await this.couponService.getDiscount({
        userId: userId,
        couponCode: couponCode,
        amount: total,
      });

      console.log('discount: ', discount);

      const { data: shipmentFee } = await this.ghnService.calculateFee({
        toWardCode: wardCode,
        toDistrictId: districtId,
      });

      console.log('shipmentFee: ', shipmentFee);

      const { data, error } = (await this.supabaseService.client.rpc(
        'create_order',
        {
          p_user_id: userId,
          p_fullname: name,
          p_phone: phone,
          p_address: address,
          p_province_id: provinceId,
          p_district_id: districtId,
          p_ward_code: wardCode,
          p_total: total - discount + shipmentFee.total,
          p_items: items,
          p_payment_url: '1',
          p_transaction_id: 1,
          p_discount: discount,
          p_shipment_fee: shipmentFee.total,
        },
      )) as { data: OrderResponse; error: unknown };
      console.log('data: ', data);

      if (error) throw new Error((error as Error).message);

      const GHNResponse = await this.ghnService.createOrder({
        items,
        address,
        phone,
        provinceId,
        districtId,
        wardCode,
        name,
      } as CreateGHNOrder);

      await this.supabaseService.client
        .from('orders')
        .update({
          code: GHNResponse.data.order_code,
        })
        .eq('id', data.order_id);

      console.log('response: ', GHNResponse);

      const momoOrderId = `${data.payment_id}_${Date.now()}`;
      const momoResponse = await this.momoService.createPayment(
        momoOrderId,
        total.toString(),
      );

      console.log('momoResponse: ', momoResponse);

      if (!momoResponse?.payUrl) throw new Error('Momo payment not found');

      await this.supabaseService.client
        .from('payments')
        .update({
          url: momoResponse.payUrl,
        })
        .eq('id', data.payment_id);

      console.log('payUrl: ', momoResponse.payUrl);
      return {
        statusCode: 200,
        message: 'Create order successfully',
        data: {
          payURL: momoResponse.payUrl,
        },
      };
    } catch (error: unknown) {
      console.error('Create order error: ', error);

      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';

      throw new BadRequestException(errorMessage);
    }
  }

  async updateStatus(id: number, status: string) {
    try {
      const { error } = await this.supabaseService.client
        .from('orders')
        .update({
          status,
        })
        .eq('id', id);

      console.log('error: ', error);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      throw new BadRequestException(errorMessage);
    }
  }

  async getMyOrders(userId: number, query: OrderQueryParams): Promise<Order[]> {
    const { page = 1, limit = 10 } = query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
      const { data, error } = await this.supabaseService.client
        .from('orders')
        .select('*, payment:payments(*)')
        .eq('userId', userId)
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      return data as Order[];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Get My Order Error';

      throw new BadRequestException(errorMessage);
    }
  }
}
