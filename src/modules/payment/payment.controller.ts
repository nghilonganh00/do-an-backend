import { Controller, Get, Query } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  async getAllPayments(@Query() query: any) {
    return await this.paymentService.getAllPayments(query);
  }
}
