import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dtos/create-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { OrderQueryParams } from './types/queryParams';

@Controller('orders')
export class OrderController {
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly orderService: OrderService,
  ) {}

  @Get()
  async getAllOrders(@Query() query: OrderQueryParams) {
    return this.orderService.getAllOrders(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(@Body() body: CreateOrderDto) {
    const user = this.request.user as {
      userId: number;
    };

    return this.orderService.createOrder(user.userId, body);
  }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getMyOrders(@Query() query: OrderQueryParams) {
    const user = this.request.user as {
      userId: number;
    };

    const data = await this.orderService.getMyOrders(user.userId, query);
    return {
      statusCode: 200,
      message: 'Get my orders successfully',
      data,
    };
  }
}
