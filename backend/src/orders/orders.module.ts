import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { PublicOrdersController } from './public-orders.controller';
import { TelegramService } from './telegram.service';

@Module( {
  imports:     [ AdminAuthModule ],
  controllers: [ OrdersController, PublicOrdersController ],
  providers:   [ OrdersService, TelegramService ],
  exports:     [ OrdersService, TelegramService ],
} )
export class OrdersModule {}
