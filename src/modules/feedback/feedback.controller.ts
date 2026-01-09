import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';

@Controller('feedbacks')
export class FeedbackController {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly feedbackService: FeedbackService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: CreateFeedbackDto) {
    const user = this.request.user as {
      userId: number;
    };

    const feedback = await this.feedbackService.create(user.userId, body);

    return {
      status: 201,
      message: 'Create feedback successfully',
      data: feedback,
    };
  }

  @Get('/product/:id')
  async getFeedbacksByProductId(@Param('id') id: number) {
    const data = await this.feedbackService.getFeedbacksByProductId(id);

    return {
      status: 200,
      message: 'Get feedbacks successfully',
      data,
    };
  }
}
