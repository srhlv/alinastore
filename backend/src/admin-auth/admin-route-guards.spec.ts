import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import request from 'supertest';
import { App } from 'supertest/types';
import { AdminAuthController } from '../admin-auth/admin-auth.controller';
import { AdminAuthService } from '../admin-auth/admin-auth.service';
import { JwtAuthGuard } from '../admin-auth/jwt-auth.guard';
import { ArtworksController } from '../artworks/artworks.controller';
import { ArtworksService } from '../artworks/artworks.service';
import { PublicArtworksController } from '../artworks/public-artworks.controller';
import { OrdersController } from '../orders/orders.controller';
import { OrdersService } from '../orders/orders.service';
import { PublicOrdersController } from '../orders/public-orders.controller';
import { UploadController } from '../upload/upload.controller';
import { UploadService } from '../upload/upload.service';

describe( 'Admin JWT protection (Step 5.5)', () => {
  let app: INestApplication<App>;
  let validToken: string;

  beforeEach( async () => {
    process.env.JWT_SECRET = 'test-secret';
    validToken = jwt.sign(
      { sub: 'admin-1', username: 'admin' },
      'test-secret',
      { expiresIn: '7d' },
    );

    const module: TestingModule = await Test.createTestingModule( {
      controllers: [
        AdminAuthController,
        ArtworksController,
        PublicArtworksController,
        OrdersController,
        PublicOrdersController,
        UploadController,
      ],
      providers: [
        JwtAuthGuard,
        {
          provide:  AdminAuthService,
          useValue: {
            login: jest.fn().mockResolvedValue( { accessToken: validToken } ),
          },
        },
        {
          provide:  ArtworksService,
          useValue: {
            findAll:       jest.fn().mockResolvedValue( [] ),
            findPublicAll: jest.fn().mockResolvedValue( [] ),
            findPublicOne: jest.fn().mockResolvedValue( { id: 'art-1', options: [], photos: [] } ),
            create:        jest.fn().mockResolvedValue( { id: 'art-1', options: [] } ),
            update:        jest.fn().mockResolvedValue( { id: 'art-1', options: [] } ),
            remove:        jest.fn().mockResolvedValue( { id: 'art-1', status: 'DELETED' } ),
            hardRemove:    jest.fn().mockResolvedValue( undefined ),
            updateStatus:  jest.fn().mockResolvedValue( { id: 'art-1', status: 'SOLD' } ),
            addPhoto:      jest.fn().mockResolvedValue( { id: 'photo-1', url: 'https://cdn.example/a.jpg' } ),
            removePhoto:   jest.fn().mockResolvedValue( { id: 'photo-1' } ),
            updatePhoto:   jest.fn().mockResolvedValue( { id: 'photo-1', isMain: true } ),
          },
        },
        {
          provide:  OrdersService,
          useValue: {
            findAll:      jest.fn().mockResolvedValue( [] ),
            findOne:      jest.fn().mockResolvedValue( { id: 'ord-1', items: [] } ),
            create:       jest.fn().mockResolvedValue( { id: 'ord-1', items: [] } ),
            updateStatus: jest.fn().mockResolvedValue( { id: 'ord-1', status: 'CONTACTED' } ),
          },
        },
        {
          provide:  UploadService,
          useValue: {
            upload: jest.fn().mockResolvedValue( { url: 'https://cdn.example/a.jpg' } ),
          },
        },
      ],
    } ).compile();

    app = module.createNestApplication();
    app.setGlobalPrefix( 'api' );
    app.useGlobalPipes(
      new ValidationPipe( {
        whitelist: true,
        transform: true,
      } ),
    );
    await app.init();
  } );

  afterEach( async () => {
    await app.close();
  } );

  describe( 'POST /api/admin/login', () => {
    it( 'remains public without Authorization header', async () => {
      await request( app.getHttpServer() )
        .post( '/api/admin/login' )
        .send( { username: 'admin', password: 'secret' } )
        .expect( 201 );
    } );
  } );

  describe.each( [
    [ 'GET', '/api/admin/artworks' ],
    [ 'POST', '/api/admin/artworks' ],
    [ 'PUT', '/api/admin/artworks/art-1' ],
    [ 'DELETE', '/api/admin/artworks/art-1' ],
    [ 'DELETE', '/api/admin/artworks/art-1/permanent' ],
    [ 'PATCH', '/api/admin/artworks/art-1/status' ],
    [ 'POST', '/api/admin/artworks/art-1/photos' ],
    [ 'DELETE', '/api/admin/artworks/art-1/photos/photo-1' ],
    [ 'PATCH', '/api/admin/artworks/art-1/photos/photo-1' ],
    [ 'GET', '/api/admin/orders' ],
    [ 'GET', '/api/admin/orders/ord-1' ],
    [ 'PATCH', '/api/admin/orders/ord-1/status' ],
    [ 'POST', '/api/admin/upload' ],
  ] )( '%s %s', ( method, path ) => {
    const createArtworkBody = {
      titleUk: 'Картина',
      titleEn: 'Painting',
      options: [ { nameUk: 'Опція', nameEn: 'Option', price: 100 } ],
    };

    it( 'returns 401 without token', async () => {
      const httpMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';

      await request( app.getHttpServer() )[ httpMethod ]( path ).expect( 401 );
    } );

    it( 'returns 401 with invalid token', async () => {
      const httpMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';

      await request( app.getHttpServer() )
        [ httpMethod ]( path )
        .set( 'Authorization', 'Bearer invalid-token' )
        .expect( 401 );
    } );

    it( 'returns 401 with token signed by a different secret', async () => {
      const httpMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
      const foreignToken = jwt.sign(
        { sub: 'admin-1', username: 'admin' },
        'other-secret',
        { expiresIn: '7d' },
      );

      await request( app.getHttpServer() )
        [ httpMethod ]( path )
        .set( 'Authorization', `Bearer ${ foreignToken }` )
        .expect( 401 );
    } );

    it( 'succeeds with valid Bearer token', async () => {
      const httpMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';
      const req        = request( app.getHttpServer() )[ httpMethod ]( path );

      if ( method === 'POST' && path === '/api/admin/artworks' ) {
        req.send( createArtworkBody );
      }

      if ( method === 'POST' && path === '/api/admin/artworks/art-1/photos' ) {
        req.send( { url: 'https://cdn.example/a.jpg' } );
      }

      if ( method === 'PUT' ) {
        req.send( { titleEn: 'Updated' } );
      }

      if ( method === 'PATCH' && path === '/api/admin/artworks/art-1/status' ) {
        req.send( { status: 'SOLD' } );
      }

      if ( method === 'PATCH' && path === '/api/admin/artworks/art-1/photos/photo-1' ) {
        req.send( { isMain: true, sortOrder: 0 } );
      }

      if ( method === 'PATCH' && path === '/api/admin/orders/ord-1/status' ) {
        req.send( { status: 'CONTACTED' } );
      }

      await req
        .set( 'Authorization', `Bearer ${ validToken }` )
        .expect(
          method === 'POST'
            ? 201
            : path.endsWith( '/permanent' )
              ? 204
              : 200,
        );
    } );
  } );

  describe( 'POST /api/public/orders', () => {
    it( 'remains public without Authorization header', async () => {
      await request( app.getHttpServer() )
        .post( '/api/public/orders' )
        .send( {
          customerName: 'Олена',
          contactInfo:  '@olena',
          items:        [
            { artworkId: 'art-1', optionId: 'opt-1', quantity: 1 },
          ],
        } )
        .expect( 201 );
    } );
  } );

  describe( 'GET /api/public/artworks', () => {
    it( 'remains public without Authorization header', async () => {
      await request( app.getHttpServer() )
        .get( '/api/public/artworks' )
        .expect( 200 );
    } );
  } );

  describe( 'GET /api/public/artworks/:id', () => {
    it( 'remains public without Authorization header', async () => {
      await request( app.getHttpServer() )
        .get( '/api/public/artworks/art-1' )
        .expect( 200 );
    } );
  } );
} );
