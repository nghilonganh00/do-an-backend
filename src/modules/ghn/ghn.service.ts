// src/ghn/ghn.service.ts
import {
  Injectable,
  HttpException,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import {
  CreateGHNOrder,
  GHNCalculateFee,
  GHNCreateOrderResponse,
  GHNOrder,
  GhnProvinceResponse,
} from './types/ghn-province.interface';
import { CalculateFeeDto } from './dtos/calculate-fee.dto';

@Injectable()
export class GhnService {
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly shopId: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('GHN_API_URL') || '';
    this.token = this.configService.get<string>('GHN_API_TOKEN') || '';
    this.shopId = this.configService.get<string>('GHN_SHOP_ID') || '';
  }

  // Helper để lấy Header chuẩn
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      Token: this.token,
      ShopId: this.shopId,
    };
  }

  async getProvinces() {
    const response = await lastValueFrom(
      this.httpService.get<GhnProvinceResponse>(
        `${this.apiUrl}/master-data/province`,
        {
          headers: { Token: this.token },
        },
      ),
    );

    return {
      statusCode: 200,
      message: 'Get provinces successfully',
      data: response.data.data,
    };
  }

  async getDistrictsByProvince({ provinceId }: { provinceId: number }) {
    try {
      const response = await lastValueFrom(
        this.httpService.post<GhnProvinceResponse>(
          `${this.apiUrl}/master-data/district`,
          {
            province_id: Number(provinceId),
          },
          {
            headers: { Token: this.token },
          },
        ),
      );

      return {
        statusCode: 200,
        message: 'Get provinces successfully',
        data: response.data.data,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'GHN Get District Error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getWardsByDistrict({ districtId }: { districtId: number }) {
    try {
      const response = await lastValueFrom(
        this.httpService.post<GhnProvinceResponse>(
          `${this.apiUrl}/master-data/ward`,
          {
            district_id: Number(districtId),
          },
          {
            headers: { Token: this.token },
          },
        ),
      );

      return {
        statusCode: 200,
        message: 'Get provinces successfully',
        data: response.data.data,
      };
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'GHN Get District Error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async createOrder(
    orderData: CreateGHNOrder,
  ): Promise<GHNCreateOrderResponse> {
    const { items, address, phone, provinceId, districtId, wardCode, name } =
      orderData;
    try {
      const payload = {
        payment_type_id: 2,
        required_note: 'CHOXEMHANGKHONGTHU',
        service_type_id: 2,
        from_name: 'Ecommerce',
        from_phone: '0389257541',
        from_address: 'HCM',
        from_ward_name: 'Phường 14',
        from_district_name: 'Quận 10',
        from_province_name: 'HCM',
        return_phone: '0332190444',
        return_address: '39 NTT',
        return_district_id: null,
        return_ward_code: '',
        client_order_code: '',
        to_name: name,
        to_phone: phone,
        to_address: address,
        to_ward_code: String(wardCode),
        to_district_id: Number(districtId),
        cod_amount: 0,
        content: 'Theo New York Times',
        weight: 200,
        length: 1,
        width: 19,
        height: 10,
        pick_station_id: 1444,
        deliver_station_id: null,
        insurance_value: 5000000,
        service_id: 0,
        coupon: null,
        pick_shift: [2],
        items: items.map((item) => ({
          name: item?.name || 'iPhone 17 256GB',
          code: String(item.productVariantId) || '13',
          quantity: item.quantity,
          price: 10000,
          length: 12,
          width: 12,
          height: 12,
          weight: 1200,
          category: {
            level1: 'Điện thoại',
          },
        })),
      };

      const response = await lastValueFrom(
        this.httpService.post(
          `${this.apiUrl}/v2/shipping-order/create`,
          payload,
          {
            headers: this.getHeaders(),
          },
        ),
      );
      return response.data;
    } catch (error) {
      // Log lỗi chi tiết để debug
      console.error('GHN Create Order Error:', error.response?.data);
      throw new HttpException(
        error.response?.data || 'GHN Create Order Error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async calculateFee(orderData: CalculateFeeDto): Promise<GHNCalculateFee> {
    const { toWardCode, toDistrictId } = orderData;

    try {
      const payload = {
        from_district_id: 1454,
        from_ward_code: '21211',
        service_id: 100039,
        service_type_id: 5,
        to_district_id: toDistrictId,
        to_ward_code: toWardCode.toString(),
        height: 50,
        length: 20,
        weight: 1000,
        width: 20,
        insurance_value: 10000,
        cod_failed_amount: 2000,
        coupon: null,
        items: [
          {
            name: 'TEST1',
            quantity: 1,
            height: 200,
            weight: 1000,
            length: 200,
            width: 200,
          },
        ],
      };

      const response = await lastValueFrom(
        this.httpService.post(`${this.apiUrl}/v2/shipping-order/fee`, payload, {
          headers: this.getHeaders(),
        }),
      );

      return response.data;
    } catch (error) {
      console.error('GHN Calculate Fee Error:', error);
      throw new HttpException(
        error || 'GHN Calculate Fee Error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getStatusOrder(orderCode: string): Promise<GHNOrder> {
    try {
      const response: { data: { data: GHNOrder } } = await lastValueFrom(
        this.httpService.get(`${this.apiUrl}/v2/shipping-order/detail`, {
          headers: this.getHeaders(),
          params: {
            order_code: orderCode,
          },
          timeout: 10000,
        }),
      );
      return response.data.data;
    } catch (error) {
      // Log lỗi chi tiết để debug
      const errorMessage =
        error instanceof Error ? error.message : 'Get Status Order Error';

      throw new BadRequestException(errorMessage);
    }
  }
}
