import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ArtworksService } from './artworks.service';

describe( 'ArtworksService (Step 6)', () => {
  let service: ArtworksService;
  let prisma: {
    artwork: {
      findMany:   jest.Mock;
      findUnique: jest.Mock;
      create:     jest.Mock;
      update:     jest.Mock;
    };
  };

  beforeEach( async () => {
    prisma = {
      artwork: {
        findMany:   jest.fn(),
        findUnique: jest.fn(),
        create:     jest.fn(),
        update:     jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule( {
      providers: [
        ArtworksService,
        {
          provide:  PrismaService,
          useValue: prisma,
        },
      ],
    } ).compile();

    service = module.get( ArtworksService );
  } );

  describe( 'findAll', () => {
    it( 'returns all artworks including DELETED with photos and options', async () => {
      const artworks = [
        {
          id:      'art-1',
          status:  'AVAILABLE',
          photos:  [ { id: 'p1', sortOrder: 0 } ],
          options: [ { id: 'o1', price: 100 } ],
        },
        {
          id:      'art-2',
          status:  'DELETED',
          photos:  [],
          options: [],
        },
      ];

      prisma.artwork.findMany.mockResolvedValue( artworks );

      await expect( service.findAll() ).resolves.toEqual( artworks );

      expect( prisma.artwork.findMany ).toHaveBeenCalledWith( {
        include: {
          photos:  { orderBy: { sortOrder: 'asc' } },
          options: true,
        },
        orderBy: { createdAt: 'desc' },
      } );
    } );
  } );

  describe( 'create', () => {
    it( 'creates artwork with nested options and returns photos+options', async () => {
      const dto = {
        titleUk:       'Картина',
        titleEn:       'Painting',
        descriptionUk: 'Опис',
        descriptionEn: 'Desc',
        options:       [
          {
            nameUk: 'Оригінал',
            nameEn: 'Original',
            price:  1500,
          },
          {
            nameUk:        'Принт',
            nameEn:        'Print',
            descriptionUk: 'A4',
            descriptionEn: 'A4',
            price:         300,
          },
        ],
      };

      const created = {
        id:      'art-new',
        ...dto,
        status:  'AVAILABLE',
        photos:  [],
        options: [
          { id: 'o1', ...dto.options[ 0 ] },
          { id: 'o2', ...dto.options[ 1 ] },
        ],
      };

      prisma.artwork.create.mockResolvedValue( created );

      await expect( service.create( dto ) ).resolves.toEqual( created );

      expect( prisma.artwork.create ).toHaveBeenCalledWith( {
        data: {
          titleUk:       dto.titleUk,
          titleEn:       dto.titleEn,
          descriptionUk: dto.descriptionUk,
          descriptionEn: dto.descriptionEn,
          options:       {
            create: [
              {
                nameUk:        'Оригінал',
                nameEn:        'Original',
                descriptionUk: undefined,
                descriptionEn: undefined,
                price:         1500,
              },
              {
                nameUk:        'Принт',
                nameEn:        'Print',
                descriptionUk: 'A4',
                descriptionEn: 'A4',
                price:         300,
              },
            ],
          },
        },
        include: {
          photos:  { orderBy: { sortOrder: 'asc' } },
          options: true,
        },
      } );
    } );
  } );

  describe( 'update', () => {
    it( 'throws NotFoundException when artwork does not exist', async () => {
      prisma.artwork.findUnique.mockResolvedValue( null );

      await expect(
        service.update( 'missing', { titleEn: 'Updated' } ),
      ).rejects.toThrow( NotFoundException );

      expect( prisma.artwork.update ).not.toHaveBeenCalled();
    } );

    it( 'updates fields and fully replaces options when provided', async () => {
      const dto = {
        titleUk: 'Нова назва',
        titleEn: 'New title',
        options: [
          {
            nameUk: 'Принт',
            nameEn: 'Print',
            price:  400,
          },
        ],
      };

      const updated = {
        id:      'art-1',
        titleUk: dto.titleUk,
        titleEn: dto.titleEn,
        status:  'AVAILABLE',
        photos:  [],
        options: [ { id: 'o-new', ...dto.options[ 0 ] } ],
      };

      prisma.artwork.findUnique.mockResolvedValue( { id: 'art-1' } );
      prisma.artwork.update.mockResolvedValue( updated );

      await expect( service.update( 'art-1', dto ) ).resolves.toEqual( updated );

      expect( prisma.artwork.update ).toHaveBeenCalledWith( {
        where: { id: 'art-1' },
        data:  {
          titleUk: dto.titleUk,
          titleEn: dto.titleEn,
          options: {
            deleteMany: {},
            create:     [
              {
                nameUk:        'Принт',
                nameEn:        'Print',
                descriptionUk: undefined,
                descriptionEn: undefined,
                price:         400,
              },
            ],
          },
        },
        include: {
          photos:  { orderBy: { sortOrder: 'asc' } },
          options: true,
        },
      } );
    } );

    it( 'updates title/description without touching options when omitted', async () => {
      const dto = {
        descriptionUk: 'Оновлений опис',
        descriptionEn: 'Updated desc',
      };

      const updated = {
        id:            'art-1',
        ...dto,
        options:       [ { id: 'o1' } ],
        photos:        [],
      };

      prisma.artwork.findUnique.mockResolvedValue( { id: 'art-1' } );
      prisma.artwork.update.mockResolvedValue( updated );

      await expect( service.update( 'art-1', dto ) ).resolves.toEqual( updated );

      expect( prisma.artwork.update ).toHaveBeenCalledWith( {
        where: { id: 'art-1' },
        data:  {
          descriptionUk: dto.descriptionUk,
          descriptionEn: dto.descriptionEn,
        },
        include: {
          photos:  { orderBy: { sortOrder: 'asc' } },
          options: true,
        },
      } );
    } );
  } );
} );
