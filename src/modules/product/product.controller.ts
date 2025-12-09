import { Controller, Get, Query } from '@nestjs/common';
import { ProductService } from './product.service';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('best-selling')
  async getBestSellingProducts(@Query() query: { duration: number }) {
    return this.productService.getBestSellingProducts({
      duration: query.duration || 30,
    });
  }
}
