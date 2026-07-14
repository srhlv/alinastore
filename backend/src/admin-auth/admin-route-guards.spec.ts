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
import { OrdersController } from '../orders/orders.controller';
import { UploadController } from '../upload/upload.controller';

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
        OrdersController,
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
            findAll: jest.fn().mockResolvedValue( [] ),
            create:  jest.fn().mockResolvedValue( { id: 'art-1', options: [] } ),
            update:  jest.fn().mockResolvedValue( { id: 'art-1', options: [] } ),
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
    [ 'GET', '/api/admin/orders' ],
    [ 'POST', '/api/admin/upload' ],
  ] )( '%s %s', ( method, path ) => {
    const createArtworkBody = {
      titleUk: 'Картина',
      titleEn: 'Painting',
      options: [ { nameUk: 'Опція', nameEn: 'Option', price: 100 } ],
    };

    it( 'returns 401 without token', async () => {
      const httpMethod = method.toLowerCase() as 'get' | 'post' | 'put';

      await request( app.getHttpServer() )[ httpMethod ]( path ).expect( 401 );
    } );

    it( 'returns 401 with invalid token', async () => {
      const httpMethod = method.toLowerCase() as 'get' | 'post' | 'put';

      await request( app.getHttpServer() )
        [ httpMethod ]( path )
        .set( 'Authorization', 'Bearer invalid-token' )
        .expect( 401 );
    } );

    it( 'returns 401 with token signed by a different secret', async () => {
      const httpMethod = method.toLowerCase() as 'get' | 'post' | 'put';
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
      const httpMethod = method.toLowerCase() as 'get' | 'post' | 'put';
      const req        = request( app.getHttpServer() )[ httpMethod ]( path );

      if ( method === 'POST' && path === '/api/admin/artworks' ) {
        req.send( createArtworkBody );
      }

      if ( method === 'PUT' ) {
        req.send( { titleEn: 'Updated' } );
      }

      await req
        .set( 'Authorization', `Bearer ${ validToken }` )
        .expect( method === 'POST' ? 201 : 200 );
    } );
  } );
} );
