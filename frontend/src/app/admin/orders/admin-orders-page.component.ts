import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  AdminOrder,
  AdminOrderStatus,
  AdminOrdersApiService,
} from '../../core/admin-orders-api.service';
import { LocaleService } from '../../locale/locale.service';

type SortKey = 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<AdminOrderStatus, number> = {
  NEW:       0,
  CONTACTED: 1,
  DONE:      2,
};

@Component( {
  selector: 'app-admin-orders-page',
  imports:  [ RouterLink ],
  template: `
    <div class="mb-6">
      <h1 class="text-2xl font-semibold tracking-tight">{{ locale.t( 'admin.orders.title' ) }}</h1>
    </div>

    @if ( loading() ) {
      <p class="text-neutral-500">{{ locale.t( 'admin.orders.loading' ) }}</p>
    } @else if ( loadError() ) {
      <p class="text-red-700" role="alert">{{ loadError() }}</p>
    } @else if ( orders().length === 0 ) {
      <p class="text-neutral-500">{{ locale.t( 'admin.orders.empty' ) }}</p>
    } @else {
      <div class="overflow-x-auto">
        <table class="w-full min-w-[48rem] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-neutral-300 text-xs tracking-wider text-neutral-500 uppercase">
              <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.orders.colId' ) }}</th>
              <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.orders.colCustomer' ) }}</th>
              <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.orders.colContact' ) }}</th>
              <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.orders.colItems' ) }}</th>
              <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.orders.colTotal' ) }}</th>
              <th class="py-2 pr-3 font-medium" [attr.aria-sort]="ariaSort( 'status' )">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 font-medium tracking-wider uppercase hover:text-neutral-900"
                  (click)="setSort( 'status' )"
                >
                  {{ locale.t( 'admin.orders.colStatus' ) }}
                  <span class="text-[0.65rem]" aria-hidden="true">{{ sortMark( 'status' ) }}</span>
                </button>
              </th>
              <th class="py-2 font-medium" [attr.aria-sort]="ariaSort( 'createdAt' )">
                <button
                  type="button"
                  class="inline-flex items-center gap-1 font-medium tracking-wider uppercase hover:text-neutral-900"
                  (click)="setSort( 'createdAt' )"
                >
                  {{ locale.t( 'admin.orders.colCreated' ) }}
                  <span class="text-[0.65rem]" aria-hidden="true">{{ sortMark( 'createdAt' ) }}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            @for ( order of sorted(); track order.id ) {
              <tr class="cursor-pointer border-b border-neutral-100 hover:bg-neutral-50" [routerLink]="[ '/admin/orders', order.id ]">
                <td class="py-3 pr-3 font-mono text-xs">{{ shortId( order.id ) }}</td>
                <td class="py-3 pr-3">{{ order.customerName }}</td>
                <td class="py-3 pr-3">{{ order.contactInfo }}</td>
                <td class="py-3 pr-3">{{ order.items.length }}</td>
                <td class="py-3 pr-3">{{ locale.formatPrice( order.total ) }} ₴</td>
                <td class="py-3 pr-3">{{ statusLabel( order.status ) }}</td>
                <td class="py-3">{{ formatDate( order.createdAt ) }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
} )
export class AdminOrdersPageComponent implements OnInit {
  private readonly api = inject( AdminOrdersApiService );

  readonly locale = inject( LocaleService );

  readonly orders    = signal<AdminOrder[]>( [] );
  readonly loading   = signal( true );
  readonly loadError = signal<string | null>( null );
  readonly sortKey   = signal<SortKey>( 'createdAt' );
  readonly sortDir   = signal<SortDir>( 'desc' );

  readonly sorted = computed( () => {
    const key  = this.sortKey();
    const dir  = this.sortDir();
    const mult = dir === 'asc' ? 1 : -1;

    return [ ...this.orders() ].sort( ( a, b ) => {
      if ( key === 'status' ) {
        return ( STATUS_ORDER[ a.status ] - STATUS_ORDER[ b.status ] ) * mult;
      }

      return ( new Date( a.createdAt ).getTime() - new Date( b.createdAt ).getTime() ) * mult;
    } );
  } );

  ngOnInit(): void {
    this.api.list().subscribe( {
      next: ( items ) => {
        this.orders.set( items );
        this.loading.set( false );
      },
      error: () => {
        this.loading.set( false );
        this.loadError.set( this.locale.t( 'admin.orders.loadError' ) );
      },
    } );
  }

  setSort( key: SortKey ): void {
    if ( this.sortKey() === key ) {
      this.sortDir.update( ( dir ) => ( dir === 'asc' ? 'desc' : 'asc' ) );
      return;
    }

    this.sortKey.set( key );
    this.sortDir.set( key === 'createdAt' ? 'desc' : 'asc' );
  }

  sortMark( key: SortKey ): string {
    if ( this.sortKey() !== key ) {
      return '↕';
    }

    return this.sortDir() === 'asc' ? '↑' : '↓';
  }

  ariaSort( key: SortKey ): 'ascending' | 'descending' | 'none' {
    if ( this.sortKey() !== key ) {
      return 'none';
    }

    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  shortId( id: string ): string {
    return id.length > 8 ? `${ id.slice( 0, 8 ) }…` : id;
  }

  statusLabel( status: AdminOrderStatus ): string {
    return this.locale.t( `admin.orderStatus.${ status }` );
  }

  formatDate( value: string ): string {
    return new Intl.DateTimeFormat(
      this.locale.isUkLocale() ? 'uk-UA' : 'en-US',
      { dateStyle: 'short', timeStyle: 'short' },
    ).format( new Date( value ) );
  }
}
