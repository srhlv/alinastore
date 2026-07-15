import { computed, Injectable, signal } from '@angular/core';

export type CartItem = {
  artworkId:    string;
  optionId:     string;
  artworkTitle: string;
  optionName:   string;
  optionPrice:  number;
  photoUrl:     string;
  quantity:     number;
};

const STORAGE_KEY = 'cart';

@Injectable( { providedIn: 'root' } )
export class CartService {
  private readonly itemsSignal = signal<CartItem[]>( this.readStoredItems() );

  readonly items     = this.itemsSignal.asReadonly();
  readonly itemCount = computed( () =>
    this.itemsSignal().reduce( ( sum, item ) => sum + item.quantity, 0 ),
  );
  readonly total = computed( () =>
    this.itemsSignal().reduce(
      ( sum, item ) => sum + item.optionPrice * item.quantity,
      0,
    ),
  );

  addItem( item: CartItem ): void {
    this.itemsSignal.update( ( items ) => {
      const existing = items.find(
        ( entry ) =>
          entry.artworkId === item.artworkId && entry.optionId === item.optionId,
      );

      if ( existing ) {
        return items.map( ( entry ) =>
          entry === existing
            ? { ...entry, quantity: entry.quantity + item.quantity }
            : entry,
        );
      }

      return [ ...items, item ];
    } );
    this.persist();
  }

  removeItem( artworkId: string, optionId: string ): void {
    this.itemsSignal.update( ( items ) =>
      items.filter(
        ( entry ) =>
          !( entry.artworkId === artworkId && entry.optionId === optionId ),
      ),
    );
    this.persist();
  }

  updateQuantity( artworkId: string, optionId: string, quantity: number ): void {
    if ( quantity <= 0 ) {
      this.removeItem( artworkId, optionId );
      return;
    }

    this.itemsSignal.update( ( items ) =>
      items.map( ( entry ) =>
        entry.artworkId === artworkId && entry.optionId === optionId
          ? { ...entry, quantity }
          : entry,
      ),
    );
    this.persist();
  }

  clear(): void {
    this.itemsSignal.set( [] );
    this.persist();
  }

  private persist(): void {
    localStorage.setItem( STORAGE_KEY, JSON.stringify( this.itemsSignal() ) );
  }

  private readStoredItems(): CartItem[] {
    try {
      const raw = localStorage.getItem( STORAGE_KEY );
      if ( !raw ) {
        return [];
      }

      const parsed: unknown = JSON.parse( raw );
      if ( !Array.isArray( parsed ) ) {
        return [];
      }

      return parsed.filter( ( entry ): entry is CartItem => this.isCartItem( entry ) );
    } catch {
      return [];
    }
  }

  private isCartItem( value: unknown ): value is CartItem {
    if ( !value || typeof value !== 'object' ) {
      return false;
    }

    const item = value as Record<string, unknown>;
    return typeof item[ 'artworkId' ] === 'string'
      && typeof item[ 'optionId' ] === 'string'
      && typeof item[ 'artworkTitle' ] === 'string'
      && typeof item[ 'optionName' ] === 'string'
      && typeof item[ 'optionPrice' ] === 'number'
      && typeof item[ 'photoUrl' ] === 'string'
      && typeof item[ 'quantity' ] === 'number'
      && item[ 'quantity' ] > 0;
  }
}
