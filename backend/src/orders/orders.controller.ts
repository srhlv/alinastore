import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../admin-auth/jwt-auth.guard';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminOrder, OrdersService } from './orders.service';

@ApiTags( 'admin-orders' )
@ApiBearerAuth()
@UseGuards( JwtAuthGuard )
@Controller( 'admin/orders' )
export class OrdersController {
  constructor( private readonly ordersService: OrdersService ) {}

  @Get()
  @ApiResponse( { status: 200, description: 'All orders with items' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  findAll(): Promise<AdminOrder[]> {
    return this.ordersService.findAll();
  }

  @Get( ':id' )
  @ApiResponse( { status: 200, description: 'Order detail with items' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  @ApiResponse( { status: 404, description: 'Order not found' } )
  findOne( @Param( 'id' ) id: string ): Promise<AdminOrder> {
    return this.ordersService.findOne( id );
  }

  @Patch( ':id/status' )
  @ApiResponse( { status: 200, description: 'Order status updated' } )
  @ApiResponse( { status: 400, description: 'Invalid status transition' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  @ApiResponse( { status: 404, description: 'Order not found' } )
  updateStatus(
    @Param( 'id' ) id: string,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<AdminOrder> {
    return this.ordersService.updateStatus( id, dto );
  }

  @Delete( ':id' )
  @HttpCode( HttpStatus.NO_CONTENT )
  @ApiResponse( { status: 204, description: 'Order permanently deleted (items cascade)' } )
  @ApiResponse( { status: 401, description: 'Unauthorized' } )
  @ApiResponse( { status: 404, description: 'Order not found' } )
  async hardRemove( @Param( 'id' ) id: string ): Promise<void> {
    await this.ordersService.hardRemove( id );
  }
}
