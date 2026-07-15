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

@Injectable( { providedIn: 'root' } )
export class CartService {
  private readonly itemsSignal = signal<CartItem[]>( [] );

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
  }

  removeItem( artworkId: string, optionId: string ): void {
    this.itemsSignal.update( ( items ) =>
      items.filter(
        ( entry ) =>
          !( entry.artworkId === artworkId && entry.optionId === optionId ),
      ),
    );
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
  }

  clear(): void {
    this.itemsSignal.set( [] );
  }
}
