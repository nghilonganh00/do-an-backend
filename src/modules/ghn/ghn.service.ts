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
    try {
      // Cấu trúc payload cần tuân thủ tài liệu GHN
      const payload = {
        payment_type_id: 2, // 1: Người bán trả, 2: Người mua trả
        required_note: 'CHOXEMHANGKHONGTHU',
        service_type_id: 2,
        ...orderData,
        // orderData cần có: to_name, to_phone, to_address, to_ward_code, to_district_id, weight, items[]
      };

      const response = await lastValueFrom(
        this.httpService.post(`${this.apiUrl}/shipping-order/create`, payload, {
          headers: this.getHeaders(),
        }),
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
