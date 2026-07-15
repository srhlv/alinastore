import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CartService } from '../core/cart.service';
import { OrdersApiService } from '../core/orders-api.service';
import { LocaleService } from '../locale/locale.service';
import { DefaultLayoutComponent } from '../shared/default-layout/default-layout.component';

@Component( {
  selector: 'app-checkout-page',
  imports:  [ DefaultLayoutComponent, ReactiveFormsModule, RouterLink ],
  template: `
    <app-default-layout>
      <h1 class="mb-8 text-2xl font-semibold tracking-tight">{{ locale.t( 'checkout.title' ) }}</h1>

      @if ( cart.items().length === 0 ) {
        <p class="text-neutral-600">{{ locale.t( 'cart.empty' ) }}</p>
        <a routerLink="/gallery" class="mt-4 inline-block text-sm underline">{{ locale.t( 'cart.toGallery' ) }}</a>
      } @else {
        <p class="mb-6 text-sm text-neutral-500">{{ locale.t( 'checkout.summary', { count: cart.itemCount(), total: locale.formatPrice( cart.total() ) } ) }}</p>

        <form class="max-w-md space-y-4" [formGroup]="form" (ngSubmit)="submit()">
          <label class="block">
            <span class="mb-1 block text-xs tracking-wider text-neutral-500 uppercase">{{ locale.t( 'checkout.customerName' ) }}</span>
            <input
              type="text"
              formControlName="customerName"
              class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              autocomplete="name"
            />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs tracking-wider text-neutral-500 uppercase">{{ locale.t( 'checkout.contactInfo' ) }}</span>
            <input
              type="text"
              formControlName="contactInfo"
              class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              autocomplete="tel"
              [placeholder]="locale.t( 'checkout.contactPlaceholder' )"
            />
          </label>

          @if ( submitError() ) {
            <p class="text-sm text-red-700" role="alert">{{ submitError() }}</p>
          }

          <button
            type="submit"
            class="w-full bg-neutral-900 px-4 py-3 text-sm tracking-wide text-white uppercase disabled:cursor-not-allowed disabled:bg-neutral-300"
            [disabled]="form.invalid || submitting()"
          >
            {{ locale.t( 'checkout.submit' ) }}
          </button>
        </form>
      }
    </app-default-layout>
  `,
} )
export class CheckoutPageComponent {
  private readonly ordersApi = inject( OrdersApiService );
  private readonly router    = inject( Router );

  readonly cart   = inject( CartService );
  readonly locale = inject( LocaleService );

  readonly submitting  = signal( false );
  readonly submitError = signal<string | null>( null );

  readonly form = new FormGroup( {
    customerName: new FormControl( '', {
      nonNullable: true,
      validators:  [ Validators.required ],
    } ),
    contactInfo: new FormControl( '', {
      nonNullable: true,
      validators:  [ Validators.required ],
    } ),
  } );

  submit(): void {
    if ( this.form.invalid || this.cart.items().length === 0 || this.submitting() ) {
      this.form.markAllAsTouched();
      return;
    }

    const { customerName, contactInfo } = this.form.getRawValue();
    this.submitting.set( true );
    this.submitError.set( null );

    this.ordersApi.submitOrder( {
      customerName: customerName.trim(),
      contactInfo:  contactInfo.trim(),
      items:        this.cart.items().map( ( item ) => ( {
        artworkId: item.artworkId,
        optionId:  item.optionId,
        quantity:  item.quantity,
      } ) ),
    } ).subscribe( {
      next: () => {
        this.cart.clear();
        void this.router.navigateByUrl( '/success' );
      },
      error: () => {
        this.submitting.set( false );
        const message = this.locale.t( 'checkout.submitError' );
        this.submitError.set( message );
        window.alert( message );
      },
    } );
  }
}
