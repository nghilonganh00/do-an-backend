import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ChatbotService } from './chatbot.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';

@Controller('chatbot')
export class ChatbotController {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly chatbotService: ChatbotService,
  ) {}

  @Get('reload')
  async reload() {
    return this.chatbotService.reload();
  }

  @Post('')
  @UseGuards(JwtAuthGuard)
  async chat(@Body() body: { message: string }) {
    const user = this.request.user as {
      userId: number;
    };

    return this.chatbotService.chat(user.userId, body.message);
  }
}
