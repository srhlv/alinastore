import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { createClient } from '@supabase/supabase-js';
import { UploadService } from './upload.service';

jest.mock( '@supabase/supabase-js', () => ( {
  createClient: jest.fn(),
} ) );

describe( 'UploadService (Step 6b)', () => {
  const createClientMock = createClient as jest.Mock;
  let uploadMock: jest.Mock;
  let getPublicUrlMock: jest.Mock;
  let service: UploadService;

  beforeEach( async () => {
    process.env.SUPABASE_URL               = 'https://example.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY  = 'service-role-key';
    process.env.SUPABASE_STORAGE_BUCKET    = 'artworks';

    uploadMock       = jest.fn();
    getPublicUrlMock = jest.fn();

    createClientMock.mockReturnValue( {
      storage: {
        from: jest.fn().mockReturnValue( {
          upload:       uploadMock,
          getPublicUrl: getPublicUrlMock,
        } ),
      },
    } );

    const module: TestingModule = await Test.createTestingModule( {
      providers: [ UploadService ],
    } ).compile();

    service = module.get( UploadService );
  } );

  afterEach( () => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.SUPABASE_STORAGE_BUCKET;
    jest.clearAllMocks();
  } );

  it( 'rejects missing file', async () => {
    await expect( service.upload( undefined ) ).rejects.toThrow( BadRequestException );
  } );

  it( 'rejects non-image mime types', async () => {
    await expect(
      service.upload( {
        originalname: 'notes.pdf',
        mimetype:     'application/pdf',
        size:         100,
        buffer:       Buffer.from( 'x' ),
      } as Express.Multer.File ),
    ).rejects.toThrow( BadRequestException );
  } );

  it( 'uploads image to storage and returns public url', async () => {
    uploadMock.mockResolvedValue( { error: null } );
    getPublicUrlMock.mockReturnValue( {
      data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/artworks/1.jpg' },
    } );

    await expect(
      service.upload( {
        originalname: 'photo.jpg',
        mimetype:     'image/jpeg',
        size:         1200,
        buffer:       Buffer.from( 'fake-image' ),
      } as Express.Multer.File ),
    ).resolves.toEqual( {
      url: 'https://example.supabase.co/storage/v1/object/public/artworks/1.jpg',
    } );

    expect( uploadMock ).toHaveBeenCalledWith(
      expect.stringMatching( /^\d+-[0-9a-f-]+\.jpg$/ ),
      Buffer.from( 'fake-image' ),
      {
        contentType: 'image/jpeg',
        upsert:      false,
      },
    );
  } );

  it( 'throws when storage upload fails', async () => {
    uploadMock.mockResolvedValue( { error: { message: 'bucket full' } } );

    await expect(
      service.upload( {
        originalname: 'photo.jpg',
        mimetype:     'image/jpeg',
        size:         100,
        buffer:       Buffer.from( 'x' ),
      } as Express.Multer.File ),
    ).rejects.toThrow( InternalServerErrorException );
  } );
} );
