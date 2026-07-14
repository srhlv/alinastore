import { BadRequestException, NotFoundException } from '@nestjs/common';
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
    photo: {
      create:     jest.Mock;
      findFirst:  jest.Mock;
      delete:     jest.Mock;
      update:     jest.Mock;
      updateMany: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach( async () => {
    prisma = {
      artwork: {
        findMany:   jest.fn(),
        findUnique: jest.fn(),
        create:     jest.fn(),
        update:     jest.fn(),
      },
      photo: {
        create:     jest.fn(),
        findFirst:  jest.fn(),
        delete:     jest.fn(),
        update:     jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
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
        id:      'art-1',
        ...dto,
        options: [ { id: 'o1' } ],
        photos:  [],
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

  describe( 'remove', () => {
    it( 'throws NotFoundException when artwork does not exist', async () => {
      prisma.artwork.findUnique.mockResolvedValue( null );

      await expect( service.remove( 'missing' ) ).rejects.toThrow( NotFoundException );

      expect( prisma.artwork.update ).not.toHaveBeenCalled();
    } );

    it( 'soft-deletes artwork by setting status to DELETED', async () => {
      const deleted = {
        id:      'art-1',
        status:  'DELETED',
        photos:  [],
        options: [],
      };

      prisma.artwork.findUnique.mockResolvedValue( { id: 'art-1' } );
      prisma.artwork.update.mockResolvedValue( deleted );

      await expect( service.remove( 'art-1' ) ).resolves.toEqual( deleted );

      expect( prisma.artwork.update ).toHaveBeenCalledWith( {
        where:   { id: 'art-1' },
        data:    { status: 'DELETED' },
        include: {
          photos:  { orderBy: { sortOrder: 'asc' } },
          options: true,
        },
      } );
    } );
  } );

  describe( 'updateStatus', () => {
    it( 'throws NotFoundException when artwork does not exist', async () => {
      prisma.artwork.findUnique.mockResolvedValue( null );

      await expect(
        service.updateStatus( 'missing', { status: 'SOLD' } ),
      ).rejects.toThrow( NotFoundException );

      expect( prisma.artwork.update ).not.toHaveBeenCalled();
    } );

    it( 'sets artwork status to the provided value', async () => {
      const updated = {
        id:      'art-1',
        status:  'SOLD',
        photos:  [],
        options: [],
      };

      prisma.artwork.findUnique.mockResolvedValue( { id: 'art-1' } );
      prisma.artwork.update.mockResolvedValue( updated );

      await expect(
        service.updateStatus( 'art-1', { status: 'SOLD' } ),
      ).resolves.toEqual( updated );

      expect( prisma.artwork.update ).toHaveBeenCalledWith( {
        where:   { id: 'art-1' },
        data:    { status: 'SOLD' },
        include: {
          photos:  { orderBy: { sortOrder: 'asc' } },
          options: true,
        },
      } );
    } );
  } );

  describe( 'addPhoto', () => {
    it( 'throws NotFoundException when artwork does not exist', async () => {
      prisma.artwork.findUnique.mockResolvedValue( null );

      await expect(
        service.addPhoto( 'missing', { url: 'https://cdn.example/a.jpg' } ),
      ).rejects.toThrow( NotFoundException );

      expect( prisma.photo.create ).not.toHaveBeenCalled();
    } );

    it( 'throws BadRequestException when artwork already has 5 photos', async () => {
      prisma.artwork.findUnique.mockResolvedValue( {
        id:     'art-1',
        photos: [ {}, {}, {}, {}, {} ],
      } );

      await expect(
        service.addPhoto( 'art-1', { url: 'https://cdn.example/a.jpg' } ),
      ).rejects.toThrow( BadRequestException );

      expect( prisma.photo.create ).not.toHaveBeenCalled();
    } );

    it( 'creates photo with next sortOrder when omitted', async () => {
      const created = {
        id:        'photo-1',
        url:       'https://cdn.example/a.jpg',
        isMain:    false,
        sortOrder: 2,
        artworkId: 'art-1',
      };

      prisma.artwork.findUnique.mockResolvedValue( {
        id:     'art-1',
        photos: [ { id: 'p1' }, { id: 'p2' } ],
      } );
      prisma.photo.create.mockResolvedValue( created );

      await expect(
        service.addPhoto( 'art-1', { url: 'https://cdn.example/a.jpg' } ),
      ).resolves.toEqual( created );

      expect( prisma.photo.create ).toHaveBeenCalledWith( {
        data: {
          url:       'https://cdn.example/a.jpg',
          isMain:    false,
          sortOrder: 2,
          artworkId: 'art-1',
        },
      } );
    } );

    it( 'clears other mains and creates isMain photo in a transaction', async () => {
      const created = {
        id:        'photo-2',
        url:       'https://cdn.example/main.jpg',
        isMain:    true,
        sortOrder: 0,
        artworkId: 'art-1',
      };

      prisma.artwork.findUnique.mockResolvedValue( {
        id:     'art-1',
        photos: [ { id: 'p1', isMain: true } ],
      } );
      prisma.$transaction.mockImplementation( async ( fn: ( tx: typeof prisma ) => unknown ) =>
        fn( prisma ),
      );
      prisma.photo.updateMany.mockResolvedValue( { count: 1 } );
      prisma.photo.create.mockResolvedValue( created );

      await expect(
        service.addPhoto( 'art-1', {
          url:       'https://cdn.example/main.jpg',
          isMain:    true,
          sortOrder: 0,
        } ),
      ).resolves.toEqual( created );

      expect( prisma.photo.updateMany ).toHaveBeenCalledWith( {
        where: { artworkId: 'art-1', isMain: true },
        data:  { isMain: false },
      } );
      expect( prisma.photo.create ).toHaveBeenCalledWith( {
        data: {
          url:       'https://cdn.example/main.jpg',
          isMain:    true,
          sortOrder: 0,
          artworkId: 'art-1',
        },
      } );
    } );
  } );

  describe( 'removePhoto', () => {
    it( 'throws NotFoundException when photo is missing for artwork', async () => {
      prisma.photo.findFirst.mockResolvedValue( null );

      await expect(
        service.removePhoto( 'art-1', 'photo-missing' ),
      ).rejects.toThrow( NotFoundException );

      expect( prisma.photo.delete ).not.toHaveBeenCalled();
    } );

    it( 'deletes photo that belongs to the artwork', async () => {
      const photo = {
        id:        'photo-1',
        url:       'https://cdn.example/a.jpg',
        isMain:    false,
        sortOrder: 0,
        artworkId: 'art-1',
      };

      prisma.photo.findFirst.mockResolvedValue( photo );
      prisma.photo.delete.mockResolvedValue( photo );

      await expect( service.removePhoto( 'art-1', 'photo-1' ) ).resolves.toEqual( photo );

      expect( prisma.photo.findFirst ).toHaveBeenCalledWith( {
        where: { id: 'photo-1', artworkId: 'art-1' },
      } );
      expect( prisma.photo.delete ).toHaveBeenCalledWith( {
        where: { id: 'photo-1' },
      } );
    } );
  } );

  describe( 'updatePhoto', () => {
    it( 'throws NotFoundException when photo is missing for artwork', async () => {
      prisma.photo.findFirst.mockResolvedValue( null );

      await expect(
        service.updatePhoto( 'art-1', 'photo-missing', { sortOrder: 1 } ),
      ).rejects.toThrow( NotFoundException );

      expect( prisma.photo.update ).not.toHaveBeenCalled();
    } );

    it( 'updates sortOrder without touching other mains', async () => {
      const existing = {
        id:        'photo-1',
        url:       'https://cdn.example/a.jpg',
        isMain:    false,
        sortOrder: 0,
        artworkId: 'art-1',
      };
      const updated = { ...existing, sortOrder: 2 };

      prisma.photo.findFirst.mockResolvedValue( existing );
      prisma.photo.update.mockResolvedValue( updated );

      await expect(
        service.updatePhoto( 'art-1', 'photo-1', { sortOrder: 2 } ),
      ).resolves.toEqual( updated );

      expect( prisma.photo.update ).toHaveBeenCalledWith( {
        where: { id: 'photo-1' },
        data:  { sortOrder: 2 },
      } );
      expect( prisma.$transaction ).not.toHaveBeenCalled();
    } );

    it( 'sets isMain and clears other mains in a transaction', async () => {
      const existing = {
        id:        'photo-2',
        url:       'https://cdn.example/b.jpg',
        isMain:    false,
        sortOrder: 1,
        artworkId: 'art-1',
      };
      const updated = { ...existing, isMain: true, sortOrder: 0 };

      prisma.photo.findFirst.mockResolvedValue( existing );
      prisma.$transaction.mockImplementation( async ( fn: ( tx: typeof prisma ) => unknown ) =>
        fn( prisma ),
      );
      prisma.photo.updateMany.mockResolvedValue( { count: 1 } );
      prisma.photo.update.mockResolvedValue( updated );

      await expect(
        service.updatePhoto( 'art-1', 'photo-2', { isMain: true, sortOrder: 0 } ),
      ).resolves.toEqual( updated );

      expect( prisma.photo.updateMany ).toHaveBeenCalledWith( {
        where: { artworkId: 'art-1', isMain: true, NOT: { id: 'photo-2' } },
        data:  { isMain: false },
      } );
      expect( prisma.photo.update ).toHaveBeenCalledWith( {
        where: { id: 'photo-2' },
        data:  { isMain: true, sortOrder: 0 },
      } );
    } );
  } );
} );
