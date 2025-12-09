import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class PaymentService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAllPayments(query: any) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc',
      status,
      userId,
    } = query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let builder = this.supabaseService.client
      .from('payments')
      .select('*, user:users(*)', { count: 'exact' });

    if (status) {
      builder = builder.eq('status', status);
    }

    if (userId) {
      builder = builder.eq('user_id', userId);
    }

    builder = builder.order(sortBy, { ascending: sortOrder === 'asc' });

    builder = builder.range(from, to);

    const { data, error, count } = await builder;

    if (error) throw new Error(error.message);

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count,
        totalPages: Math.ceil((count || 0) / limit),
      },
    };
  }

  async createPayment({ amount, userId }: { amount: number; userId: number }) {
    const { data, error } = await this.supabaseService.client
      .from('payments')
      .insert({
        amount,
        userId,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }
}
