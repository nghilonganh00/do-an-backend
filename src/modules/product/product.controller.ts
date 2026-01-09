import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { QueryParams } from 'src/types/queryParams';
import { CacheService } from '../cache/cache.service';
import { ProductVariant } from './types/product-variant.entity';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly cacheService: CacheService,
  ) {}

  @Get('best-selling')
  async getBestSellingProducts(@Query() query: { duration: number }) {
    console.log('query: ', query);
    return this.productService.getBestSellingProducts({
      duration: query.duration || 30,
    });
  }

  @Get('/hot-sales')
  async getHotSalesProducts(@Query() query: QueryParams) {
    const cacheKey = `hot-sales:${query.page ?? 1}:${query.limit ?? 10}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached !== null)
      return JSON.parse(cached as string) as ProductVariant[];

    const data = await this.productService.getHotSalesProducts(query);

    await this.cacheService.set(cacheKey, JSON.stringify(data));

    return data;
  }

  @Get('best-salers')
  async getBestSalerProducts(@Query() query: QueryParams) {
    const cacheKey = `best-salers:${query.page ?? 1}:${query.limit ?? 10}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached !== null)
      return JSON.parse(cached as string) as ProductVariant[];

    const data = await this.productService.getBestSalerProducts(query);

    await this.cacheService.set(cacheKey, JSON.stringify(data));

    return data;
  }

  @Get('best-ratings')
  async getBestRatingProducts(@Query() query: QueryParams) {
    const cacheKey = `best-ratings:${query.page ?? 1}:${query.limit ?? 10}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached !== null)
      return JSON.parse(cached as string) as ProductVariant[];

    const data = await this.productService.getBestSalerProducts(query);

    await this.cacheService.set(cacheKey, JSON.stringify(data));

    return data;
  }

  @Get(':id')
  async getProductById(@Param('id', ParseIntPipe) id: number) {
    console.log('id: ', id);
    const product = await this.productService.getProductById(id);

    return {
      statusCode: 200,
      message: 'Get product successfully',
      data: product,
    };
  }

  @Delete(':id')
  async deleteProduct(@Param('id', ParseIntPipe) id: number) {
    console.log('id: ', id);
    return this.productService.deleteProduct(id);
  }
}
