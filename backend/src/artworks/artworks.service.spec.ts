import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ArtworksService } from './artworks.service';

describe( 'ArtworksService (Step 6.3)', () => {
  let service: ArtworksService;
  let prisma: {
    artwork: {
      findMany: jest.Mock;
    };
  };

  beforeEach( async () => {
    prisma = {
      artwork: {
        findMany: jest.fn(),
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
} );
