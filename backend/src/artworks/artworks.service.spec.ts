import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ArtworksService } from './artworks.service';

describe( 'ArtworksService (Step 6)', () => {
  let service: ArtworksService;
  let prisma: {
    artwork: {
      findMany: jest.Mock;
      create:   jest.Mock;
    };
  };

  beforeEach( async () => {
    prisma = {
      artwork: {
        findMany: jest.fn(),
        create:   jest.fn(),
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
} );
