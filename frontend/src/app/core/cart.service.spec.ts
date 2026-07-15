import { TestBed } from '@angular/core/testing';

import { CartItem, CartService } from './cart.service';

describe( 'CartService', () => {
  let service: CartService;

  const sampleItem: CartItem = {
    artworkId:    'art-1',
    optionId:     'opt-1',
    artworkTitle: 'Пейзаж',
    optionName:   'Оригінал',
    optionPrice:  2500,
    photoUrl:     'https://example.com/a.jpg',
    quantity:     1,
  };

  beforeEach( () => {
    localStorage.clear();
    TestBed.configureTestingModule( {} );
    service = TestBed.inject( CartService );
  } );

  afterEach( () => {
    localStorage.clear();
  } );

  it( 'adds items, merges quantity for same artwork+option, and persists to localStorage.cart', () => {
    service.addItem( sampleItem );
    service.addItem( { ...sampleItem, quantity: 2 } );

    expect( service.items() ).toEqual( [ { ...sampleItem, quantity: 3 } ] );
    expect( service.itemCount() ).toBe( 3 );
    expect( service.total() ).toBe( 7500 );
    expect( JSON.parse( localStorage.getItem( 'cart' )! ) ).toEqual( [
      { ...sampleItem, quantity: 3 },
    ] );
  } );

  it( 'loads cart from localStorage.cart on init', () => {
    localStorage.setItem( 'cart', JSON.stringify( [ sampleItem ] ) );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule( {} );

    const fresh = TestBed.inject( CartService );

    expect( fresh.items() ).toEqual( [ sampleItem ] );
    expect( fresh.itemCount() ).toBe( 1 );
  } );

  it( 'updates quantity, removes item, and clears cart with persistence', () => {
    service.addItem( sampleItem );
    service.updateQuantity( 'art-1', 'opt-1', 4 );
    expect( service.itemCount() ).toBe( 4 );

    service.removeItem( 'art-1', 'opt-1' );
    expect( service.items() ).toEqual( [] );
    expect( localStorage.getItem( 'cart' ) ).toBe( '[]' );

    service.addItem( sampleItem );
    service.clear();
    expect( service.items() ).toEqual( [] );
    expect( localStorage.getItem( 'cart' ) ).toBe( '[]' );
  } );

  it( 'ignores invalid stored cart JSON', () => {
    localStorage.setItem( 'cart', '{not-json' );
    TestBed.resetTestingModule();
    TestBed.configureTestingModule( {} );

    expect( TestBed.inject( CartService ).items() ).toEqual( [] );
  } );
} );
