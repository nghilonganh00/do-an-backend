import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dtos/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  async getAllOrders(@Query() query: any) {
    return this.orderService.getAllOrders(query);
  }

  @Post()
  async createOrder(@Body() body: CreateOrderDto) {
    return this.orderService.createOrder(body);
  }
}
