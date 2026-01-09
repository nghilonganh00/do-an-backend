import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { ChatMessage, ChatRole } from './types/chat_message.entity';
import { writeFile } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class ChatbotService {
  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async reload() {
    const { data, error } = await this.supabaseService.client
      .from('productVariants')
      .select(
        'id, variantName, price, stock, product:products(name, metaDescription)',
      );

    console.log('error 1: ', error);
    if (error) throw error;

    const result = (data as any[]).map((v) => ({
      id: v.id,
      price: v.price,
      stock: v.stock,
      variantName: v.variantName,
      productName: v.product?.name,
      description: v.variantName + ' ' + (v.product?.metaDescription ?? ''),
    }));

    // 📁 đường dẫn file
    const filePath = join(process.cwd(), 'product_variants.json');

    // 💾 ghi file JSON (pretty cho dễ đọc)
    await writeFile(filePath, JSON.stringify(result, null, 2), 'utf-8');

    console.log('✅ Đã lưu file:', filePath);

    return result;
  }

  async chat(userId: number, message: string) {
    try {
      const { data } = await this.supabaseService.client
        .from('chatMessages')
        .select('*')
        .eq('userId', userId)
        .order('created_at', { ascending: false })
        .limit(2);

      const messages = data?.map((item: ChatMessage) => ({
        role: item.role,
        content: item.content,
      }));

      const response = await this.httpService.axiosRef.post(
        'http://127.0.0.1:8080/chatbot',
        { q: message, messages },
      );

      await this.supabaseService.client.from('chatMessages').insert({
        role: ChatRole.USER,
        content: message,
        userId,
      });

      await this.supabaseService.client.from('chatMessages').insert({
        role: ChatRole.ASSISTANT,
        content: response.data.message,
        userId,
      });

      return {
        statusCode: 200,
        message: 'Chat successfully',
        data: response.data,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unexpected error occurred';
      throw new BadRequestException(errorMessage);
    }
  }
}
