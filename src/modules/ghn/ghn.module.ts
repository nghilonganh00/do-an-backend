// src/ghn/ghn.module.ts
import { Module } from '@nestjs/common';
import { GhnService } from './ghn.service';
import { GhnController } from './ghn.controller';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [GhnController],
  providers: [GhnService],
  exports: [GhnService],
})
export class GhnModule {}
