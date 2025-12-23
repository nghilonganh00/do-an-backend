// src/ghn/ghn.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { GhnProvinceResponse } from './types/ghn-province.interface';

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

  async calculateFee(data: any) {
    try {
      const payload = {
        from_district_id: 1454, // Ví dụ: Quận 3, HCM (Kho của bạn)
        service_type_id: 2, // 2: Chuẩn, 53320: Bay... (Tuỳ chọn)
        ...data, // Truyền to_district_id, to_ward_code, weight, height, length, width
      };

      const response = await lastValueFrom(
        this.httpService.post(`${this.apiUrl}/shipping-order/fee`, payload, {
          headers: this.getHeaders(),
        }),
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data || 'GHN Calculate Fee Error',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // 3. Tạo đơn hàng (Create Order)
  async createOrder(orderData: any) {
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
}
