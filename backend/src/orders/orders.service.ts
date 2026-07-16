import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { TelegramService } from './telegram.service';

const orderAdminInclude = {
  items: true,
} satisfies Prisma.OrderInclude;

export type AdminOrder = Prisma.OrderGetPayload<{
  include: typeof orderAdminInclude;
}>;

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  NEW:       [ OrderStatus.CONTACTED ],
  CONTACTED: [ OrderStatus.DONE ],
  DONE:      [],
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramService: TelegramService,
  ) {}

  findAll(): Promise<AdminOrder[]> {
    return this.prisma.order.findMany( {
      include: orderAdminInclude,
      orderBy: { createdAt: 'desc' },
    } );
  }

  async findOne( id: string ): Promise<AdminOrder> {
    const order = await this.prisma.order.findUnique( {
      where:   { id },
      include: orderAdminInclude,
    } );

    if ( !order ) {
      throw new NotFoundException( `Order ${ id } not found` );
    }

    return order;
  }

  async create( dto: CreateOrderDto ): Promise<AdminOrder> {
    const itemSnapshots: Prisma.OrderItemCreateWithoutOrderInput[] = [];
    let total = 0;

    for ( const item of dto.items ) {
      const option = await this.prisma.option.findFirst( {
        where: {
          id:        item.optionId,
          artworkId: item.artworkId,
        },
        include: { artwork: true },
      } );

      if ( !option ) {
        throw new BadRequestException(
          `Option ${ item.optionId } not found for artwork ${ item.artworkId }`,
        );
      }

      if ( option.artwork.status !== 'AVAILABLE' ) {
        throw new BadRequestException(
          `Artwork ${ item.artworkId } is not available for purchase`,
        );
      }

      const optionPrice = Number( option.price );
      total += optionPrice * item.quantity;

      itemSnapshots.push( {
        artwork:      { connect: { id: item.artworkId } },
        artworkTitle: option.artwork.titleUk,
        optionName:   option.nameUk,
        optionPrice:  option.price,
        quantity:     item.quantity,
      } );
    }

    const order = await this.prisma.order.create( {
      data: {
        customerName: dto.customerName,
        contactInfo:  dto.contactInfo,
        total,
        cartJson:     dto.items as unknown as Prisma.InputJsonValue,
        items:        { create: itemSnapshots },
      },
      include: orderAdminInclude,
    } );

    await this.telegramService.sendOrderNotification( {
      id:           order.id,
      customerName: order.customerName,
      contactInfo:  order.contactInfo,
      total:        order.total,
      items:        order.items.map( ( item ) => ( {
        artworkTitle: item.artworkTitle,
        optionName:   item.optionName,
        optionPrice:  item.optionPrice,
        quantity:     item.quantity,
      } ) ),
    } );

    return order;
  }

  async updateStatus( id: string, dto: UpdateOrderStatusDto ): Promise<AdminOrder> {
    const order = await this.prisma.order.findUnique( { where: { id } } );

    if ( !order ) {
      throw new NotFoundException( `Order ${ id } not found` );
    }

    const allowed = STATUS_TRANSITIONS[ order.status ];

    if ( !allowed.includes( dto.status ) ) {
      throw new BadRequestException(
        `Cannot transition order from ${ order.status } to ${ dto.status }`,
      );
    }

    return this.prisma.order.update( {
      where:   { id },
      data:    { status: dto.status },
      include: orderAdminInclude,
    } );
  }

  async hardRemove( id: string ): Promise<void> {
    const existing = await this.prisma.order.findUnique( { where: { id } } );

    if ( !existing ) {
      throw new NotFoundException( `Order ${ id } not found` );
    }

    await this.prisma.order.delete( { where: { id } } );
  }
}
