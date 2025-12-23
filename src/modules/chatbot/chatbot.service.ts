import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatbotService {
  constructor(private readonly httpService: HttpService) {}

  async chat(message: string) {
    const response = await this.httpService.axiosRef.get(
      'http://127.0.0.1:8080/chatbot',
      {
        params: {
          q: message,
        },
      },
    );

    return {
      statusCode: 200,
      message: 'Chat successfully',
      data: response.data,
    };
  }
}
