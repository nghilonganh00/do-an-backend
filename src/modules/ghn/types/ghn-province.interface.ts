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
