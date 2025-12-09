import { Controller, Get, Param } from '@nestjs/common';
import { GhnService } from './ghn.service';

@Controller('ghn')
export class GhnController {
  constructor(private readonly ghnService: GhnService) {}

  @Get('provinces')
  async getProvinces() {
    return this.ghnService.getProvinces();
  }

  @Get('districts/:provinceId')
  async getDistrictsByProvince(@Param('provinceId') provinceId: number) {
    return this.ghnService.getDistrictsByProvince({ provinceId });
  }

  @Get('wards/:districtId')
  async getWardsByDistrict(@Param('districtId') districtId: number) {
    return this.ghnService.getWardsByDistrict({ districtId });
  }

  // @Post('fee')
  // async calculateFee(@Body() body: any) {
  //   return this.ghnService.calculateFee(body);
  // }

  // @Post('create-order')
  // async createOrder(@Body() body: any) {
  //   return this.ghnService.createOrder(body);
  // }
}
