import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';
import { TelegramService } from './telegram.service';

describe( 'OrdersService (Step 8)', () => {
  let service: OrdersService;
  let prisma: {
    order: {
      findMany:   jest.Mock;
      findUnique: jest.Mock;
      create:     jest.Mock;
      update:     jest.Mock;
      delete:     jest.Mock;
    };
    option: {
      findFirst: jest.Mock;
    };
  };
  let telegram: {
    sendOrderNotification: jest.Mock;
  };

  beforeEach( async () => {
    prisma = {
      order: {
        findMany:   jest.fn(),
        findUnique: jest.fn(),
        create:     jest.fn(),
        update:     jest.fn(),
        delete:     jest.fn(),
      },
      option: {
        findFirst: jest.fn(),
      },
    };
    telegram = {
      sendOrderNotification: jest.fn().mockResolvedValue( undefined ),
    };

    const module: TestingModule = await Test.createTestingModule( {
      providers: [
        OrdersService,
        {
          provide:  PrismaService,
          useValue: prisma,
        },
        {
          provide:  TelegramService,
          useValue: telegram,
        },
      ],
    } ).compile();

    service = module.get( OrdersService );
  } );

  describe( 'findAll', () => {
    it( 'returns orders with items newest first', async () => {
      const orders = [ { id: 'o1', items: [] } ];
      prisma.order.findMany.mockResolvedValue( orders );

      await expect( service.findAll() ).resolves.toEqual( orders );

      expect( prisma.order.findMany ).toHaveBeenCalledWith( {
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      } );
    } );
  } );

  describe( 'findOne', () => {
    it( 'throws NotFoundException when missing', async () => {
      prisma.order.findUnique.mockResolvedValue( null );

      await expect( service.findOne( 'missing' ) ).rejects.toThrow( NotFoundException );
    } );

    it( 'returns order with items', async () => {
      const order = { id: 'o1', items: [ { id: 'i1' } ] };
      prisma.order.findUnique.mockResolvedValue( order );

      await expect( service.findOne( 'o1' ) ).resolves.toEqual( order );
    } );
  } );

  describe( 'create', () => {
    it( 'rejects when option does not belong to artwork', async () => {
      prisma.option.findFirst.mockResolvedValue( null );

      await expect(
        service.create( {
          customerName: 'Олена',
          contactInfo:  '@olena',
          items:        [
            { artworkId: 'art-1', optionId: 'opt-x', quantity: 1 },
          ],
        } ),
      ).rejects.toThrow( BadRequestException );

      expect( prisma.order.create ).not.toHaveBeenCalled();
    } );

    it( 'rejects when artwork is not AVAILABLE', async () => {
      prisma.option.findFirst.mockResolvedValue( {
        id:        'opt-1',
        price:     100,
        nameUk:    'Принт',
        artworkId: 'art-1',
        artwork:   { id: 'art-1', titleUk: 'Картина', status: 'SOLD' },
      } );

      await expect(
        service.create( {
          customerName: 'Олена',
          contactInfo:  '@olena',
          items:        [
            { artworkId: 'art-1', optionId: 'opt-1', quantity: 1 },
          ],
        } ),
      ).rejects.toThrow( BadRequestException );
    } );

    it( 'creates order with snapshots, total, and notifies Telegram', async () => {
      prisma.option.findFirst.mockResolvedValue( {
        id:        'opt-1',
        price:     150,
        nameUk:    'Принт',
        artworkId: 'art-1',
        artwork:   { id: 'art-1', titleUk: 'Картина', status: 'AVAILABLE' },
      } );

      const created = {
        id:           'ord-1',
        customerName: 'Олена',
        contactInfo:  '@olena',
        total:        300,
        items:        [
          {
            artworkTitle: 'Картина',
            optionName:   'Принт',
            optionPrice:  150,
            quantity:     2,
          },
        ],
      };

      prisma.order.create.mockResolvedValue( created );

      await expect(
        service.create( {
          customerName: 'Олена',
          contactInfo:  '@olena',
          items:        [
            { artworkId: 'art-1', optionId: 'opt-1', quantity: 2 },
          ],
        } ),
      ).resolves.toEqual( created );

      expect( prisma.order.create ).toHaveBeenCalledWith( {
        data: {
          customerName: 'Олена',
          contactInfo:  '@olena',
          total:        300,
          cartJson:     [
            { artworkId: 'art-1', optionId: 'opt-1', quantity: 2 },
          ],
          items: {
            create: [
              {
                artwork:      { connect: { id: 'art-1' } },
                artworkTitle: 'Картина',
                optionName:   'Принт',
                optionPrice:  150,
                quantity:     2,
              },
            ],
          },
        },
        include: { items: true },
      } );

      expect( telegram.sendOrderNotification ).toHaveBeenCalledWith( {
        id:           'ord-1',
        customerName: 'Олена',
        contactInfo:  '@olena',
        total:        300,
        items:        [
          {
            artworkTitle: 'Картина',
            optionName:   'Принт',
            optionPrice:  150,
            quantity:     2,
          },
        ],
      } );
    } );
  } );

  describe( 'updateStatus', () => {
    it( 'throws NotFoundException when missing', async () => {
      prisma.order.findUnique.mockResolvedValue( null );

      await expect(
        service.updateStatus( 'missing', { status: 'CONTACTED' } ),
      ).rejects.toThrow( NotFoundException );
    } );

    it( 'allows NEW → CONTACTED', async () => {
      prisma.order.findUnique.mockResolvedValue( { id: 'ord-1', status: 'NEW' } );
      prisma.order.update.mockResolvedValue( {
        id:     'ord-1',
        status: 'CONTACTED',
        items:  [],
      } );

      await expect(
        service.updateStatus( 'ord-1', { status: 'CONTACTED' } ),
      ).resolves.toMatchObject( { status: 'CONTACTED' } );
    } );

    it( 'rejects NEW → DONE', async () => {
      prisma.order.findUnique.mockResolvedValue( { id: 'ord-1', status: 'NEW' } );

      await expect(
        service.updateStatus( 'ord-1', { status: 'DONE' } ),
      ).rejects.toThrow( BadRequestException );

      expect( prisma.order.update ).not.toHaveBeenCalled();
    } );

    it( 'allows CONTACTED → DONE', async () => {
      prisma.order.findUnique.mockResolvedValue( {
        id:     'ord-1',
        status: 'CONTACTED',
      } );
      prisma.order.update.mockResolvedValue( {
        id:     'ord-1',
        status: 'DONE',
        items:  [],
      } );

      await expect(
        service.updateStatus( 'ord-1', { status: 'DONE' } ),
      ).resolves.toMatchObject( { status: 'DONE' } );
    } );
  } );

  describe( 'hardRemove', () => {
    it( 'deletes an existing order', async () => {
      prisma.order.findUnique.mockResolvedValue( { id: 'ord-1' } );
      prisma.order.delete.mockResolvedValue( { id: 'ord-1' } );

      await expect( service.hardRemove( 'ord-1' ) ).resolves.toBeUndefined();

      expect( prisma.order.delete ).toHaveBeenCalledWith( { where: { id: 'ord-1' } } );
    } );

    it( 'throws NotFoundException when missing', async () => {
      prisma.order.findUnique.mockResolvedValue( null );

      await expect( service.hardRemove( 'missing' ) ).rejects.toThrow( NotFoundException );
      expect( prisma.order.delete ).not.toHaveBeenCalled();
    } );
  } );
} );
