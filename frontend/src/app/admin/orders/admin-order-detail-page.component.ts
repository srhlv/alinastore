import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import {
  AdminOrder,
  AdminOrderStatus,
  AdminOrderStatusUpdate,
  AdminOrdersApiService,
} from '../../core/admin-orders-api.service';
import { LocaleService } from '../../locale/locale.service';

const NEXT_STATUS: Partial<Record<AdminOrderStatus, AdminOrderStatusUpdate>> = {
  NEW:       'CONTACTED',
  CONTACTED: 'DONE',
};

@Component( {
  selector: 'app-admin-order-detail-page',
  imports:  [ RouterLink ],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold tracking-tight">{{ locale.t( 'admin.orderDetail.title' ) }}</h1>
      <a routerLink="/admin/orders" class="text-sm underline">{{ locale.t( 'admin.orderDetail.back' ) }}</a>
    </div>

    @if ( loading() ) {
      <p class="text-neutral-500">{{ locale.t( 'admin.orderDetail.loading' ) }}</p>
    } @else if ( loadError() ) {
      <p class="text-red-700" role="alert">{{ loadError() }}</p>
    } @else if ( order(); as current ) {
      <section class="mb-8 space-y-2 text-sm">
        <p><span class="text-neutral-500">{{ locale.t( 'admin.orderDetail.id' ) }}:</span> <span class="font-mono text-xs">{{ current.id }}</span></p>
        <p><span class="text-neutral-500">{{ locale.t( 'admin.orderDetail.customer' ) }}:</span> {{ current.customerName }}</p>
        <p><span class="text-neutral-500">{{ locale.t( 'admin.orderDetail.contact' ) }}:</span> {{ current.contactInfo }}</p>
        <p><span class="text-neutral-500">{{ locale.t( 'admin.orderDetail.created' ) }}:</span> {{ formatDate( current.createdAt ) }}</p>
        <p><span class="text-neutral-500">{{ locale.t( 'admin.orderDetail.status' ) }}:</span> {{ statusLabel( current.status ) }}</p>
        <p><span class="text-neutral-500">{{ locale.t( 'admin.orderDetail.total' ) }}:</span> {{ locale.formatPrice( current.total ) }} ₴</p>
      </section>

      <div class="mb-8 flex flex-wrap items-center gap-2">
        @if ( nextStatus(); as next ) {
          <button
            type="button"
            class="border border-neutral-300 px-4 py-2 text-sm tracking-wide uppercase hover:border-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
            [disabled]="statusBusy() || deleteBusy()"
            (click)="setStatus( next )"
          >
            {{ markLabel( next ) }}
          </button>
        }
        <button
          type="button"
          class="border border-red-700 px-4 py-2 text-sm tracking-wide text-red-700 uppercase hover:bg-red-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          [disabled]="deleteBusy() || statusBusy()"
          (click)="hardDelete()"
        >
          {{ locale.t( 'admin.orderDetail.deleteForever' ) }}
        </button>
      </div>

      @if ( statusError() ) {
        <p class="mb-8 text-sm text-red-700" role="alert">{{ statusError() }}</p>
      }
      @if ( deleteError() ) {
        <p class="mb-8 text-sm text-red-700" role="alert">{{ deleteError() }}</p>
      }

      <h2 class="mb-3 text-sm font-medium tracking-wider uppercase">{{ locale.t( 'admin.orderDetail.items' ) }}</h2>

      @if ( current.items.length === 0 ) {
        <p class="text-neutral-500">{{ locale.t( 'admin.orderDetail.noItems' ) }}</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full min-w-[32rem] border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-neutral-300 text-xs tracking-wider text-neutral-500 uppercase">
                <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.orderDetail.colArtwork' ) }}</th>
                <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.orderDetail.colOption' ) }}</th>
                <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.orderDetail.colPrice' ) }}</th>
                <th class="py-2 font-medium">{{ locale.t( 'admin.orderDetail.colQty' ) }}</th>
              </tr>
            </thead>
            <tbody>
              @for ( item of current.items; track item.id ) {
                <tr class="border-b border-neutral-100">
                  <td class="py-3 pr-3">{{ item.artworkTitle }}</td>
                  <td class="py-3 pr-3">{{ item.optionName }}</td>
                  <td class="py-3 pr-3">{{ locale.formatPrice( item.optionPrice ) }} ₴</td>
                  <td class="py-3">{{ item.quantity }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    }
  `,
} )
export class AdminOrderDetailPageComponent implements OnInit {
  private readonly api    = inject( AdminOrdersApiService );
  private readonly router = inject( Router );

  readonly locale = inject( LocaleService );
  readonly id     = input.required<string>();

  readonly order       = signal<AdminOrder | null>( null );
  readonly loading     = signal( true );
  readonly loadError   = signal<string | null>( null );
  readonly statusBusy  = signal( false );
  readonly statusError = signal<string | null>( null );
  readonly deleteBusy  = signal( false );
  readonly deleteError = signal<string | null>( null );

  readonly nextStatus = computed( () => {
    const current = this.order();
    return current ? NEXT_STATUS[ current.status ] ?? null : null;
  } );

  ngOnInit(): void {
    this.api.get( this.id() ).subscribe( {
      next: ( order ) => {
        this.order.set( order );
        this.loading.set( false );
      },
      error: () => {
        this.loading.set( false );
        this.loadError.set( this.locale.t( 'admin.orderDetail.loadError' ) );
      },
    } );
  }

  setStatus( status: AdminOrderStatusUpdate ): void {
    const current = this.order();
    if ( !current || this.statusBusy() || this.deleteBusy() ) {
      return;
    }

    this.statusBusy.set( true );
    this.statusError.set( null );

    this.api.updateStatus( current.id, status ).subscribe( {
      next: ( updated ) => {
        this.order.set( updated );
        this.statusBusy.set( false );
      },
      error: () => {
        this.statusBusy.set( false );
        this.statusError.set( this.locale.t( 'admin.orderDetail.statusError' ) );
      },
    } );
  }

  hardDelete(): void {
    const current = this.order();
    if ( !current || this.deleteBusy() ) {
      return;
    }

    if ( !window.confirm( this.locale.t( 'admin.orderDetail.deleteForeverConfirm' ) ) ) {
      return;
    }

    this.deleteBusy.set( true );
    this.deleteError.set( null );

    this.api.hardDelete( current.id ).subscribe( {
      next: () => {
        this.deleteBusy.set( false );
        void this.router.navigateByUrl( '/admin/orders' );
      },
      error: () => {
        this.deleteBusy.set( false );
        this.deleteError.set( this.locale.t( 'admin.orderDetail.deleteForeverError' ) );
      },
    } );
  }

  statusLabel( status: AdminOrderStatus ): string {
    return this.locale.t( `admin.orderStatus.${ status }` );
  }

  markLabel( status: AdminOrderStatusUpdate ): string {
    return this.locale.t( `admin.orderDetail.mark.${ status }` );
  }

  formatDate( value: string ): string {
    return new Intl.DateTimeFormat(
      this.locale.isUkLocale() ? 'uk-UA' : 'en-US',
      { dateStyle: 'short', timeStyle: 'short' },
    ).format( new Date( value ) );
  }
}
