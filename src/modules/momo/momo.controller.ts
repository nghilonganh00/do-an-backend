import { Body, Controller, Post } from '@nestjs/common';
import { MomoService } from './momo.service';

@Controller('momo')
export class MomoController {
  constructor(private readonly momoService: MomoService) {}

  @Post('ipn')
  async ipn(@Body() body: any) {
    return this.momoService.handleIpn(body);
  }
}
