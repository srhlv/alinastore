import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AdminOrdersApiService } from './admin-orders-api.service';

describe( 'AdminOrdersApiService', () => {
  let service:  AdminOrdersApiService;
  let httpMock: HttpTestingController;

  beforeEach( () => {
    TestBed.configureTestingModule( {
      providers: [ provideHttpClient(), provideHttpClientTesting() ],
    } );

    service  = TestBed.inject( AdminOrdersApiService );
    httpMock = TestBed.inject( HttpTestingController );
  } );

  afterEach( () => {
    httpMock.verify();
  } );

  it( 'GETs /api/admin/orders', () => {
    service.list().subscribe( ( result ) => {
      expect( result.length ).toBe( 1 );
    } );

    const req = httpMock.expectOne( '/api/admin/orders' );
    expect( req.request.method ).toBe( 'GET' );
    req.flush( [ { id: 'o1', status: 'NEW', items: [] } ] );
  } );

  it( 'GETs /api/admin/orders/:id', () => {
    service.get( 'o1' ).subscribe( ( result ) => {
      expect( result.id ).toBe( 'o1' );
    } );

    const req = httpMock.expectOne( '/api/admin/orders/o1' );
    expect( req.request.method ).toBe( 'GET' );
    req.flush( { id: 'o1', status: 'NEW', items: [] } );
  } );

  it( 'PATCHes /api/admin/orders/:id/status', () => {
    service.updateStatus( 'o1', 'CONTACTED' ).subscribe( ( result ) => {
      expect( result.status ).toBe( 'CONTACTED' );
    } );

    const req = httpMock.expectOne( '/api/admin/orders/o1/status' );
    expect( req.request.method ).toBe( 'PATCH' );
    expect( req.request.body ).toEqual( { status: 'CONTACTED' } );
    req.flush( { id: 'o1', status: 'CONTACTED', items: [] } );
  } );
} );
