import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ShipmentService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async createShipment({
    fullName,
    address,
    email,
    phone,
    ward,
    district,
    province,
    country,
  }: {
    fullName: string;
    address: string;
    email: string;
    phone: string;
    ward: string;
    district: string;
    province: string;
    country: string;
  }) {
    const { data, error } = await this.supabaseService.client
      .from('shipments')
      .insert({
        fullName,
        address,
        email,
        phone,
        ward,
        district,
        province,
        country,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    return data;
  }
}
