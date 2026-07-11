import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { OrdersController } from './orders.controller';

@Module({
  imports: [ AdminAuthModule ],
  controllers: [ OrdersController ],
})
export class OrdersModule {}
