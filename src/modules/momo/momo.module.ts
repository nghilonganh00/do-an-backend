// src/ghn/ghn.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MomoService } from './momo.service';
import { MomoController } from './momo.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [MomoController],
  providers: [MomoService],
  exports: [MomoService],
})
export class MomoModule {}
