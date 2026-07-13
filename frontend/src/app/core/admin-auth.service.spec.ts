import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminAuthService } from './admin-auth.service';

describe( 'AdminAuthService', () => {
  let service: AdminAuthService;
  let httpMock: HttpTestingController;

  beforeEach( () => {
    localStorage.clear();

    TestBed.configureTestingModule( {
      providers: [ provideHttpClient(), provideHttpClientTesting() ],
    } );

    service  = TestBed.inject( AdminAuthService );
    httpMock = TestBed.inject( HttpTestingController );
  } );

  afterEach( () => {
    httpMock.verify();
    localStorage.clear();
  } );

  it( 'stores accessToken in localStorage.token after successful login', () => {
    service.login( { username: 'admin', password: 'secret' } ).subscribe( ( response ) => {
      expect( response.accessToken ).toBe( 'jwt-token' );
      expect( localStorage.getItem( 'token' ) ).toBe( 'jwt-token' );
    } );

    const req = httpMock.expectOne( '/api/admin/login' );
    expect( req.request.method ).toBe( 'POST' );
    expect( req.request.body ).toEqual( { username: 'admin', password: 'secret' } );
    req.flush( { accessToken: 'jwt-token' } );
  } );

  it( 'does not store token when login request fails', () => {
    service.login( { username: 'admin', password: 'wrong' } ).subscribe( {
      next:  () => fail( 'expected login to fail' ),
      error: () => {
        expect( localStorage.getItem( 'token' ) ).toBeNull();
      },
    } );

    const req = httpMock.expectOne( '/api/admin/login' );
    req.flush( 'Invalid credentials', { status: 401, statusText: 'Unauthorized' } );
  } );

  it( 'returns token from localStorage via getToken', () => {
    localStorage.setItem( 'token', 'stored-token' );

    expect( service.getToken() ).toBe( 'stored-token' );
  } );

  it( 'reports authentication state via isAuthenticated', () => {
    expect( service.isAuthenticated() ).toBe( false );

    localStorage.setItem( 'token', 'stored-token' );

    expect( service.isAuthenticated() ).toBe( true );
  } );

  it( 'removes token from localStorage on logout', () => {
    localStorage.setItem( 'token', 'stored-token' );

    service.logout();

    expect( localStorage.getItem( 'token' ) ).toBeNull();
    expect( service.isAuthenticated() ).toBe( false );
  } );
} );
