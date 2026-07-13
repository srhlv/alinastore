import { UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';

describe( 'AdminAuthController', () => {
  let app: INestApplication<App>;
  let adminAuthService: {
    login: jest.Mock;
  };

  beforeEach( async () => {
    adminAuthService = {
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule( {
      controllers: [ AdminAuthController ],
      providers:   [
        {
          provide:  AdminAuthService,
          useValue: adminAuthService,
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

  it( 'POST /api/admin/login returns accessToken for valid credentials', async () => {
    adminAuthService.login.mockResolvedValue( { accessToken: 'jwt-token' } );

    await request( app.getHttpServer() )
      .post( '/api/admin/login' )
      .send( { username: 'admin', password: 'secret' } )
      .expect( 201 )
      .expect( { accessToken: 'jwt-token' } );

    expect( adminAuthService.login ).toHaveBeenCalledWith( 'admin', 'secret' );
  } );

  it( 'POST /api/admin/login returns 401 for invalid credentials', async () => {
    adminAuthService.login.mockRejectedValue(
      new UnauthorizedException( 'Invalid credentials' ),
    );

    await request( app.getHttpServer() )
      .post( '/api/admin/login' )
      .send( { username: 'admin', password: 'wrong' } )
      .expect( 401 );
  } );

  it( 'POST /api/admin/login returns 400 for invalid body', async () => {
    await request( app.getHttpServer() )
      .post( '/api/admin/login' )
      .send( { username: 'admin' } )
      .expect( 400 );
  } );
} );
