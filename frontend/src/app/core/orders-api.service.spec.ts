import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { OrdersApiService, SubmitOrderPayload } from './orders-api.service';

describe( 'OrdersApiService', () => {
  let service:  OrdersApiService;
  let httpMock: HttpTestingController;

  beforeEach( () => {
    TestBed.configureTestingModule( {
      providers: [ provideHttpClient(), provideHttpClientTesting() ],
    } );

    service  = TestBed.inject( OrdersApiService );
    httpMock = TestBed.inject( HttpTestingController );
  } );

  afterEach( () => {
    httpMock.verify();
  } );

  it( 'POSTs /api/public/orders', () => {
    const payload: SubmitOrderPayload = {
      customerName: 'Олена',
      contactInfo:  '@olena',
      items:        [
        { artworkId: 'art-1', optionId: 'opt-1', quantity: 1 },
      ],
    };

    service.submitOrder( payload ).subscribe( ( result ) => {
      expect( result.id ).toBe( 'order-1' );
    } );

    const req = httpMock.expectOne( '/api/public/orders' );
    expect( req.request.method ).toBe( 'POST' );
    expect( req.request.body ).toEqual( payload );
    req.flush( { id: 'order-1', status: 'NEW', total: 2500 } );
  } );
} );
