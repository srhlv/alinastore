import { OrderStatus } from '@prisma/client';
import { IsEnum, IsIn } from 'class-validator';

const UPDATABLE_ORDER_STATUSES = [ OrderStatus.CONTACTED, OrderStatus.DONE ] as const;

export class UpdateOrderStatusDto {
  @IsEnum( OrderStatus )
  @IsIn( UPDATABLE_ORDER_STATUSES )
  status!: typeof UPDATABLE_ORDER_STATUSES[ number ];
}
