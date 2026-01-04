export class GhnProvince {
  ProvinceID: number;
  ProvinceName: string;
  CountryID: number;
  Code: string;
  NameExtension: string[];
  IsEnable: number;
  RegionID: number;
  RegionCPN: number;
  UpdatedBy: number;
  CreatedAt: string;
  UpdatedAt: string;
  CanUpdateCOD: boolean;
  Status: number;
  UpdatedIP: string;
  UpdatedEmployee: number;
  UpdatedSource: string;
  UpdatedDate: string;
}

export class GhnProvinceResponse {
  code: number;
  message: string;
  data: GhnProvince[];
}

export type GHNCalculateFee = {
  data: {
    total: number;
  };
};

export type CreateGHNOrder = {
  items: any[];
  address: string;
  phone: string;
  provinceId: number;
  districtId: number;
  wardCode: string;
  name: string;
};

export type GHNOrder = {
  status: string;
};

export type GHNCreateOrderResponse = {
  data: {
    order_code: string;
  };
};
