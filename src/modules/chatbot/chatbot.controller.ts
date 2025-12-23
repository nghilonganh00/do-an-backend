import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';

@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly chatbotService: ChatbotService) {}

  @Post('')
  async chat(@Body() body: any) {
    return this.chatbotService.chat(body.message);
  }
}
