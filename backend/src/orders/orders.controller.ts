import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../admin-auth/jwt-auth.guard';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrder, OrdersService } from './orders.service';

@UseGuards( JwtAuthGuard )
@Controller( 'admin/orders' )
export class OrdersController {
  constructor( private readonly ordersService: OrdersService ) {}

  @Get()
  findAll(): Promise<AdminOrder[]> {
    return this.ordersService.findAll();
  }

  @Get( ':id' )
  findOne( @Param( 'id' ) id: string ): Promise<AdminOrder> {
    return this.ordersService.findOne( id );
  }

  @Patch( ':id/status' )
  updateStatus(
    @Param( 'id' ) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<AdminOrder> {
    return this.ordersService.updateStatus( id, dto );
  }
}
