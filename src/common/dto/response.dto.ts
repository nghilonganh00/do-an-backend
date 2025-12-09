import { Expose } from 'class-transformer';

export class ResponseDto<TData> {
  @Expose()
  readonly data: TData;

  @Expose()
  readonly statusCode: number;

  @Expose()
  readonly message: string;

  @Expose()
  readonly timestamp: Date;

  constructor({
    data,
    statusCode = 200,
    message = 'Success',
  }: {
    data: TData;
    statusCode?: number;
    message?: string;
  }) {
    this.data = data;
    this.statusCode = statusCode;
    this.message = message;
    this.timestamp = new Date();
  }
}
