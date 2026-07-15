import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  AdminArtworksApiService,
  AdminArtworkPayload,
} from './admin-artworks-api.service';

describe( 'AdminArtworksApiService', () => {
  let service:  AdminArtworksApiService;
  let httpMock: HttpTestingController;

  beforeEach( () => {
    TestBed.configureTestingModule( {
      providers: [ provideHttpClient(), provideHttpClientTesting() ],
    } );

    service  = TestBed.inject( AdminArtworksApiService );
    httpMock = TestBed.inject( HttpTestingController );
  } );

  afterEach( () => {
    httpMock.verify();
  } );

  it( 'GETs /api/admin/artworks', () => {
    service.list().subscribe( ( result ) => {
      expect( result.length ).toBe( 1 );
    } );

    const req = httpMock.expectOne( '/api/admin/artworks' );
    expect( req.request.method ).toBe( 'GET' );
    req.flush( [ { id: 'a1' } ] );
  } );

  it( 'POSTs artwork payload to /api/admin/artworks', () => {
    const payload: AdminArtworkPayload = {
      titleUk: 'Пейзаж',
      titleEn: 'Landscape',
      options: [ { nameUk: 'Оригінал', nameEn: 'Original', price: 2500 } ],
    };

    service.create( payload ).subscribe( ( result ) => {
      expect( result.id ).toBe( 'a1' );
    } );

    const req = httpMock.expectOne( '/api/admin/artworks' );
    expect( req.request.method ).toBe( 'POST' );
    expect( req.request.body ).toEqual( payload );
    req.flush( { id: 'a1', ...payload, status: 'AVAILABLE', photos: [], options: [] } );
  } );

  it( 'PATCHes status and uploads multipart file', () => {
    service.updateStatus( 'a1', 'SOLD' ).subscribe();
    const statusReq = httpMock.expectOne( '/api/admin/artworks/a1/status' );
    expect( statusReq.request.method ).toBe( 'PATCH' );
    expect( statusReq.request.body ).toEqual( { status: 'SOLD' } );
    statusReq.flush( { id: 'a1', status: 'SOLD' } );

    const file = new File( [ 'x' ], 'photo.jpg', { type: 'image/jpeg' } );
    service.upload( file ).subscribe( ( result ) => {
      expect( result.url ).toBe( 'https://cdn/photo.jpg' );
    } );

    const uploadReq = httpMock.expectOne( '/api/admin/upload' );
    expect( uploadReq.request.method ).toBe( 'POST' );
    expect( uploadReq.request.body instanceof FormData ).toBe( true );
    uploadReq.flush( { url: 'https://cdn/photo.jpg' } );
  } );
} );
