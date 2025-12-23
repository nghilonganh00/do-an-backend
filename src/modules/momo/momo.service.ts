import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class MomoService {
  private readonly logger = new Logger(MomoService.name);

  private readonly accessKey = 'F8BBA842ECF85';
  private readonly secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
  private readonly partnerCode = 'MOMO';
  private readonly partnerName = 'Test';
  private readonly storeId = 'MomoTestStore';
  private readonly redirectUrl ='http://localhost:3000/dashboard';
  private readonly ipnUrl = 'http://localhost:8000/api/momo/ipn';
  private readonly requestType = 'payWithMethod';
  private readonly lang = 'vi';
  private readonly autoCapture = true;
  private readonly extraData = '';
  private readonly orderGroupId = '';

  constructor(
    private readonly httpService: HttpService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async createPayment(amount: string) {
    const orderId = this.partnerCode + Date.now();
    const requestId = orderId;
    const orderInfo = 'pay with MoMo';

    const rawSignature = `accessKey=${this.accessKey}&amount=${amount}&extraData=${this.extraData}&ipnUrl=${this.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${this.partnerCode}&redirectUrl=${this.redirectUrl}&requestId=${requestId}&requestType=${this.requestType}`;

    this.logger.log('--------------------RAW SIGNATURE----------------');
    this.logger.log(rawSignature);

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    this.logger.log('--------------------SIGNATURE----------------');
    this.logger.log(signature);

    const requestBody = {
      partnerCode: this.partnerCode,
      partnerName: this.partnerName,
      storeId: this.storeId,
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl: this.redirectUrl,
      ipnUrl: this.ipnUrl,
      lang: this.lang,
      requestType: this.requestType,
      autoCapture: this.autoCapture,
      extraData: this.extraData,
      orderGroupId: this.orderGroupId,
      signature,
    };

    try {
      const response$ = this.httpService.post(
        'https://test-payment.momo.vn/v2/gateway/api/create',
        requestBody,
        { headers: { 'Content-Type': 'application/json' } },
      );
      const response = await lastValueFrom(response$);

      this.logger.log('Status: ' + response.status);
      this.logger.log('Body: ' + JSON.stringify(response.data));

      return response.data;
    } catch (error: any) {
      this.logger.error('Error sending payment request', error.message);
      throw error;
    }
  }

  async handleIpn(body: any) {
    console.log('body: ', body);

    const {
      partnerCode,
      orderId,
      requestId,
      amount,
      orderInfo,
      orderType,
      transId,
      resultCode,
      message,
      payType,
      responseTime,
      extraData,
      signature,
    } = body;

    const rawSignature =
      `accessKey=${this.accessKey}&amount=${amount}&extraData=${extraData}` +
      `&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}` +
      `&orderType=${orderType}&partnerCode=${partnerCode}` +
      `&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}` +
      `&resultCode=${resultCode}&transId=${transId}`;

    const checkSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(rawSignature)
      .digest('hex');

    if (signature !== checkSignature) {
      this.logger.error('INVALID SIGNATURE FROM MOMO!');
      return { message: 'Invalid signature' };
    }

    const { error } = await this.supabaseService.client
      .from('payments')
      .update({
        status: resultCode === 0 ? 'paid' : 'pending',
        transactionId: transId,
        updatedAt: new Date().toISOString(),
      })
      .eq('orderId', orderId);

    if (error) {
      this.logger.error('Supabase update error: ' + error.message);
    }

    return {
      partnerCode,
      requestId,
      orderId,
      resultCode: 0,
      message: 'Received',
    };
  }
}
