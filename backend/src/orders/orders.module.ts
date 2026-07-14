import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { OrdersController } from './orders.controller';
import { TelegramService } from './telegram.service';

@Module( {
  imports:     [ AdminAuthModule ],
  controllers: [ OrdersController ],
  providers:   [ TelegramService ],
  exports:     [ TelegramService ],
} )
export class OrdersModule {}
