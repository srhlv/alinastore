import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { AdminOrder, OrdersService } from './orders.service';

@ApiTags( 'public-orders' )
@Controller( 'public/orders' )
export class PublicOrdersController {
  constructor( private readonly ordersService: OrdersService ) {}

  @Post()
  @ApiResponse( { status: 201, description: 'Order created; Telegram notification sent' } )
  @ApiResponse( { status: 400, description: 'Validation failed or artwork unavailable' } )
  create( @Body() dto: CreateOrderDto ): Promise<AdminOrder> {
    return this.ordersService.create( dto );
  }
}
