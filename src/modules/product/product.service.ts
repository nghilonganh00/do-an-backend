import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { Product } from './types/product.entity';
import { QueryParams } from 'src/types/queryParams';
import { ProductVariant } from './types/product-variant.entity';

@Injectable()
export class ProductService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async increaseView(id: number) {
    try {
      const { error } = await this.supabaseService.client.rpc(
        'increase_product_view',
        { p_id: id },
      );

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Increase View Error';
      throw new BadRequestException(errorMessage);
    }
  }

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

  async getProductById(id: number) {
    try {
      const { data, error } = await this.supabaseService.client
        .from('products')
        .select(
          `
      *,
      category:categories(*),
      variants:productVariants(*)
      `,
        )
        .eq('id', id)
        .single<Product>();

      if (error) throw new Error(error.message);

      this.increaseView(id);

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'get product error';

      throw new BadRequestException(errorMessage);
    }
  }

  async getHotSalesProducts(params: QueryParams) {
    try {
      const { limit = 10 } = params;

      const { data, error } = (await this.supabaseService.client.rpc(
        'get_hot_sale_product_variants',
        {
          p_limit: limit,
        },
      )) as { data: Product[]; error: unknown };

      if (error) throw new Error((error as Error).message);

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      throw new BadRequestException(errorMessage);
    }
  }

  async getBestSalerProducts(params: QueryParams) {
    try {
      const { limit = 10 } = params;

      console.log('limit: ', limit);

      const { data, error } = (await this.supabaseService.client.rpc(
        'get_best_saler_product_variants',
        {
          p_limit: limit,
        },
      )) as { data: ProductVariant[]; error: unknown };

      console.log('get best saler: ', error);
      if (error) throw new Error((error as Error).message);

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      throw new BadRequestException(errorMessage);
    }
  }

  async getBestRatingProducts(params: QueryParams) {
    try {
      const { limit = 10 } = params;

      const { data, error } = (await this.supabaseService.client.rpc(
        'get_top_star_product_variants',
        {
          p_limit: limit,
        },
      )) as { data: ProductVariant[]; error: unknown };

      console.log('get best saler: ', error);
      if (error) throw new Error((error as Error).message);

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      throw new BadRequestException(errorMessage);
    }
  }
}
