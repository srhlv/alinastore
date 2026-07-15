import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  ArtworksApiService,
  PublicArtworkListItem,
} from './artworks-api.service';

describe( 'ArtworksApiService', () => {
  let service:  ArtworksApiService;
  let httpMock: HttpTestingController;

  beforeEach( () => {
    TestBed.configureTestingModule( {
      providers: [ provideHttpClient(), provideHttpClientTesting() ],
    } );

    service  = TestBed.inject( ArtworksApiService );
    httpMock = TestBed.inject( HttpTestingController );
  } );

  afterEach( () => {
    httpMock.verify();
  } );

  it( 'GETs /api/public/artworks', () => {
    const items: PublicArtworkListItem[] = [
      {
        id:             'art-1',
        titleUk:        'Пейзаж',
        titleEn:        'Landscape',
        status:         'AVAILABLE',
        thumbnailUrl:   'https://example.com/a.jpg',
        minOptionPrice: 2500,
      },
    ];

    service.getArtworks().subscribe( ( result ) => {
      expect( result ).toEqual( items );
    } );

    const req = httpMock.expectOne( '/api/public/artworks' );
    expect( req.request.method ).toBe( 'GET' );
    req.flush( items );
  } );
} );
