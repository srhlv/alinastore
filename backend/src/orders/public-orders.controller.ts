import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdminOrder, OrdersService } from './orders.service';

@Controller( 'public/orders' )
export class PublicOrdersController {
  constructor( private readonly ordersService: OrdersService ) {}

  @Post()
  create( @Body() dto: CreateOrderDto ): Promise<AdminOrder> {
    return this.ordersService.create( dto );
  }
}
