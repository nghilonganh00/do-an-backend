import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { Feedback } from './types/feedback.entity';
import { OrderItem } from '../order-items/types/order-item.entity';

@Injectable()
export class FeedbackService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(userId: number, body: CreateFeedbackDto) {
    try {
      const { comment, rating, orderItemId } = body;
      const { data: feedback, error } = await this.supabaseService.client
        .from('feedbacks')
        .insert({
          userId,
          comment,
          rating,
          orderItemId,
        })
        .single<Feedback>();

      const { data: orderItem } = await this.supabaseService.client
        .from('orderItems')
        .select('*, productVariant:productVariants(*, product:products(*))')
        .eq('id', orderItemId)
        .single<OrderItem>();

      if (!orderItem) throw new Error('Order item not found');

      const newOrderCount =
        orderItem?.productVariant?.product?.orderCount || 0 + 1;
      const newRating =
        (orderItem.productVariant.product.rating *
          orderItem.productVariant.product.orderCount +
          rating) /
        newOrderCount;

      await this.supabaseService.client.from('products').update({
        orderCount: orderItem.productVariant.product.orderCount + 1,
        rating: newRating,
      });

      if (error) throw new Error(error.message);

      return feedback;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      throw new BadRequestException(errorMessage);
    }
  }

  async getFeedbacksByProductId(id: number): Promise<Feedback[]> {
    try {
      const { data, error } = await this.supabaseService.client
        .from('feedbacks')
        .select(
          `*, orderItem:orderItems(*, productVariant:productVariants(*, product:products(*))), user:users(*)`,
        )
        .eq('orderItem.productVariant.product.id', id);

      if (error) throw new Error(error.message);

      return (data ?? []) as Feedback[];
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      throw new BadRequestException(errorMessage);
    }
  }
}
