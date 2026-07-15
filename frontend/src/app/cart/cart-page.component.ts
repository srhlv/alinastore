import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService } from '../core/cart.service';
import { LocaleService } from '../locale/locale.service';
import { DefaultLayoutComponent } from '../shared/default-layout/default-layout.component';

@Component( {
  selector: 'app-cart-page',
  imports:  [ DefaultLayoutComponent, RouterLink ],
  template: `
    <app-default-layout>
      <h1 class="mb-8 text-2xl font-semibold tracking-tight">{{ locale.t( 'cart.title' ) }}</h1>

      @if ( cart.items().length === 0 ) {
        <p class="text-neutral-600">{{ locale.t( 'cart.empty' ) }}</p>
        <a routerLink="/gallery" class="mt-4 inline-block text-sm underline">{{ locale.t( 'cart.toGallery' ) }}</a>
      } @else {
        <ul class="divide-y divide-neutral-200 border-y border-neutral-200">
          @for ( item of cart.items(); track item.artworkId + ':' + item.optionId ) {
            <li class="flex flex-wrap items-center gap-4 py-4">
              <a [routerLink]="[ '/gallery', item.artworkId ]" class="h-20 w-16 shrink-0 overflow-hidden bg-neutral-200">
                @if ( item.photoUrl ) {
                  <img [src]="item.photoUrl" [alt]="item.artworkTitle" class="h-full w-full object-cover" />
                }
              </a>

              <div class="min-w-0 flex-1">
                <div class="text-sm font-medium">{{ item.artworkTitle }}</div>
                <div class="text-sm text-neutral-500">{{ item.optionName }}</div>
                <div class="mt-1 text-sm text-neutral-500">{{ locale.formatPrice( item.optionPrice ) }} ₴ × {{ item.quantity }}</div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="h-8 w-8 border border-neutral-300 text-sm hover:border-neutral-900"
                  (click)="cart.updateQuantity( item.artworkId, item.optionId, item.quantity - 1 )"
                >
                  −
                </button>
                <span class="w-6 text-center text-sm">{{ item.quantity }}</span>
                <button
                  type="button"
                  class="h-8 w-8 border border-neutral-300 text-sm hover:border-neutral-900"
                  (click)="cart.updateQuantity( item.artworkId, item.optionId, item.quantity + 1 )"
                >
                  +
                </button>
              </div>

              <div class="w-24 text-right text-sm">{{ locale.formatPrice( item.optionPrice * item.quantity ) }} ₴</div>

              <button
                type="button"
                class="text-sm text-neutral-500 underline hover:text-neutral-900"
                (click)="cart.removeItem( item.artworkId, item.optionId )"
              >
                {{ locale.t( 'cart.remove' ) }}
              </button>
            </li>
          }
        </ul>

        <div class="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div class="text-sm">
            <span class="text-neutral-500">{{ locale.t( 'cart.subtotal' ) }}</span>
            <span class="ml-2 font-medium">{{ locale.formatPrice( cart.total() ) }} ₴</span>
          </div>
          <a routerLink="/checkout" class="bg-neutral-900 px-6 py-3 text-sm tracking-wide text-white uppercase">{{ locale.t( 'cart.checkout' ) }}</a>
        </div>
      }
    </app-default-layout>
  `,
} )
export class CartPageComponent {
  readonly cart   = inject( CartService );
  readonly locale = inject( LocaleService );
}
