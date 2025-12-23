import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProductService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getBestSellingProducts(query: { duration: number }) {
    const { duration = 30 } = query;

    const { data, error } = await this.supabaseService.client.rpc(
      'get_best_selling_products',
      {
        duration_days: duration,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    return {
      statusCode: 200,
      message: 'Get best selling products successfully',
      data,
    };
  }

  async deleteProduct(id: number) {
    const { error } = await this.supabaseService.client
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
