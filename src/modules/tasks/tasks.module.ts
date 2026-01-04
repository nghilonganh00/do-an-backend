import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { GhnModule } from '../ghn/ghn.module';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [GhnModule, OrderModule],
  providers: [TasksService],
})
export class TasksModule {}
