import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { adminAuthGuard } from './admin-auth.guard';
import { AdminAuthService } from './admin-auth.service';

describe( 'adminAuthGuard', () => {
  let auth: AdminAuthService;
  let router: Router;

  beforeEach( () => {
    localStorage.clear();

    TestBed.configureTestingModule( {
      providers: [ provideRouter( [] ) ],
    } );

    auth   = TestBed.inject( AdminAuthService );
    router = TestBed.inject( Router );
  } );

  afterEach( () => {
    localStorage.clear();
  } );

  it( 'allows activation when authenticated', () => {
    localStorage.setItem( 'token', 'jwt-token' );

    const result = TestBed.runInInjectionContext( () => adminAuthGuard(
      {} as never,
      {} as never,
    ) );

    expect( result ).toBe( true );
    expect( auth.isAuthenticated() ).toBe( true );
  } );

  it( 'redirects to /admin/login when not authenticated', () => {
    const result = TestBed.runInInjectionContext( () => adminAuthGuard(
      {} as never,
      {} as never,
    ) );

    expect( result ).toEqual( router.createUrlTree( [ '/admin/login' ] ) );
  } );
} );
