import { TestBed } from '@angular/core/testing';

import { LocaleService } from './locale.service';

describe( 'LocaleService', () => {
  let service: LocaleService;

  beforeEach( () => {
    localStorage.clear();
    TestBed.configureTestingModule( {} );
    service = TestBed.inject( LocaleService );
  } );

  afterEach( () => {
    localStorage.clear();
  } );

  it( 'defaults to uk and persists setLocale to localStorage.lang', () => {
    expect( service.locale() ).toBe( 'uk' );
    expect( service.isUkLocale() ).toBe( true );

    service.setLocale( 'en' );

    expect( service.locale() ).toBe( 'en' );
    expect( service.isEnLocale() ).toBe( true );
    expect( localStorage.getItem( 'lang' ) ).toBe( 'en' );
  } );

  it( 'reads stored lang from localStorage on init', () => {
    localStorage.setItem( 'lang', 'en' );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule( {} );

    const fresh = TestBed.inject( LocaleService );

    expect( fresh.locale() ).toBe( 'en' );
  } );

  it( 'translates UI keys from locale JSON files', () => {
    expect( service.t( 'nav.cart' ) ).toBe( 'Кошик' );

    service.setLocale( 'en' );

    expect( service.t( 'nav.cart' ) ).toBe( 'Cart' );
  } );

  it( 'interpolates params in translation strings', () => {
    expect( service.t( 'common.fromPrice', { price: '2 500' } ) ).toBe( 'від 2 500 ₴' );
  } );

  it( 'picks localized catalog fields by active locale', () => {
    const artwork = {
      titleUk:       'Пейзаж',
      titleEn:       'Landscape',
      descriptionUk: 'Опис',
      descriptionEn: 'Description',
    };

    expect( service.pickLocalized( artwork.titleUk, artwork.titleEn ) ).toBe( 'Пейзаж' );
    expect( service.localizedField( artwork, 'title' ) ).toBe( 'Пейзаж' );
    expect( service.localizedField( artwork, 'description' ) ).toBe( 'Опис' );

    service.setLocale( 'en' );

    expect( service.pickLocalized( artwork.titleUk, artwork.titleEn ) ).toBe( 'Landscape' );
    expect( service.localizedField( artwork, 'title' ) ).toBe( 'Landscape' );
  } );

  it( 'formats prices with the active locale', () => {
    expect( service.formatPrice( 2500 ) ).toBe( '2\u00A0500' );
    expect( service.formatPrice( '800.00' ) ).toBe( '800' );

    service.setLocale( 'en' );

    expect( service.formatPrice( 2500 ) ).toBe( '2,500' );
  } );
} );
