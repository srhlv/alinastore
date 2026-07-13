import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { jwtHttpInterceptor } from './jwt-http.interceptor';

describe( 'jwtHttpInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach( () => {
    localStorage.clear();

    TestBed.configureTestingModule( {
      providers: [
        provideHttpClient( withInterceptors( [ jwtHttpInterceptor ] ) ),
        provideHttpClientTesting(),
      ],
    } );

    http     = TestBed.inject( HttpClient );
    httpMock = TestBed.inject( HttpTestingController );
  } );

  afterEach( () => {
    httpMock.verify();
    localStorage.clear();
  } );

  it( 'adds Authorization Bearer token for /api/admin/* requests', () => {
    localStorage.setItem( 'token', 'jwt-token' );

    http.get( '/api/admin/artworks' ).subscribe();

    const req = httpMock.expectOne( '/api/admin/artworks' );
    expect( req.request.headers.get( 'Authorization' ) ).toBe( 'Bearer jwt-token' );
    req.flush( [] );
  } );

  it( 'adds Authorization for absolute admin API URLs', () => {
    localStorage.setItem( 'token', 'jwt-token' );

    http.get( 'http://localhost:3000/api/admin/orders' ).subscribe();

    const req = httpMock.expectOne( 'http://localhost:3000/api/admin/orders' );
    expect( req.request.headers.get( 'Authorization' ) ).toBe( 'Bearer jwt-token' );
    req.flush( [] );
  } );

  it( 'does not add Authorization for public API requests', () => {
    localStorage.setItem( 'token', 'jwt-token' );

    http.get( '/api/public/artworks' ).subscribe();

    const req = httpMock.expectOne( '/api/public/artworks' );
    expect( req.request.headers.has( 'Authorization' ) ).toBe( false );
    req.flush( [] );
  } );

  it( 'does not add Authorization when token is missing', () => {
    http.get( '/api/admin/artworks' ).subscribe();

    const req = httpMock.expectOne( '/api/admin/artworks' );
    expect( req.request.headers.has( 'Authorization' ) ).toBe( false );
    req.flush( [] );
  } );
} );
