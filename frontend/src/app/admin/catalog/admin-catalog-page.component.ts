import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  AdminArtStatus,
  AdminArtwork,
  AdminArtworksApiService,
} from '../../core/admin-artworks-api.service';
import { LocaleService } from '../../locale/locale.service';

type CatalogFilter = 'all' | AdminArtStatus;

@Component( {
  selector: 'app-admin-catalog-page',
  imports:  [ RouterLink ],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold tracking-tight">{{ locale.t( 'admin.catalog.title' ) }}</h1>
      <a
        routerLink="/admin/artworks/new"
        class="bg-neutral-900 px-4 py-2 text-sm tracking-wide text-white uppercase"
      >{{ locale.t( 'admin.catalog.add' ) }}</a>
    </div>

    <div class="mb-6 flex flex-wrap gap-2 text-sm">
      @for ( item of filters; track item.value ) {
        <button
          type="button"
          class="border px-3 py-1.5 tracking-wide uppercase"
          [class.border-neutral-900]="filter() === item.value"
          [class.bg-neutral-900]="filter() === item.value"
          [class.text-white]="filter() === item.value"
          [class.border-neutral-300]="filter() !== item.value"
          (click)="filter.set( item.value )"
        >
          {{ locale.t( item.labelKey ) }}
        </button>
      }
    </div>

    @if ( loading() ) {
      <p class="text-neutral-500">{{ locale.t( 'admin.catalog.loading' ) }}</p>
    } @else if ( loadError() ) {
      <p class="text-red-700" role="alert">{{ loadError() }}</p>
    } @else if ( filtered().length === 0 ) {
      <p class="text-neutral-500">{{ locale.t( 'admin.catalog.empty' ) }}</p>
    } @else {
      <div class="overflow-x-auto">
        <table class="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr class="border-b border-neutral-300 text-xs tracking-wider text-neutral-500 uppercase">
              <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.catalog.colThumb' ) }}</th>
              <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.catalog.colTitle' ) }}</th>
              <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.catalog.colStatus' ) }}</th>
              <th class="py-2 pr-3 font-medium">{{ locale.t( 'admin.catalog.colPrice' ) }}</th>
              <th class="py-2 font-medium">{{ locale.t( 'admin.catalog.colOptions' ) }}</th>
            </tr>
          </thead>
          <tbody>
            @for ( artwork of filtered(); track artwork.id ) {
              <tr class="border-b border-neutral-100 hover:bg-neutral-50">
                <td class="py-3 pr-3">
                  <a [routerLink]="[ '/admin/artworks', artwork.id ]" class="block h-14 w-14 overflow-hidden bg-neutral-100">
                    @if ( thumbUrl( artwork ); as url ) {
                      <img [src]="url" [alt]="locale.localizedField( artwork, 'title' )" class="h-full w-full object-cover" />
                    }
                  </a>
                </td>
                <td class="py-3 pr-3">
                  <a [routerLink]="[ '/admin/artworks', artwork.id ]" class="underline-offset-2 hover:underline">
                    {{ locale.localizedField( artwork, 'title' ) }}
                  </a>
                </td>
                <td class="py-3 pr-3">{{ statusLabel( artwork.status ) }}</td>
                <td class="py-3 pr-3">
                  @if ( minPrice( artwork ); as price ) {
                    {{ locale.formatPrice( price ) }} ₴
                  } @else {
                    —
                  }
                </td>
                <td class="py-3">{{ artwork.options.length }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
} )
export class AdminCatalogPageComponent implements OnInit {
  private readonly api = inject( AdminArtworksApiService );

  readonly locale = inject( LocaleService );

  readonly filter    = signal<CatalogFilter>( 'all' );
  readonly artworks  = signal<AdminArtwork[]>( [] );
  readonly loading   = signal( true );
  readonly loadError = signal<string | null>( null );

  readonly filters: { value: CatalogFilter; labelKey: string }[] = [
    { value: 'all',       labelKey: 'admin.catalog.filterAll' },
    { value: 'AVAILABLE', labelKey: 'admin.catalog.filterAvailable' },
    { value: 'SOLD',      labelKey: 'admin.catalog.filterSold' },
    { value: 'DELETED',   labelKey: 'admin.catalog.filterDeleted' },
  ];

  readonly filtered = computed( () => {
    const selected = this.filter();
    const items    = this.artworks();
    return selected === 'all' ? items : items.filter( ( item ) => item.status === selected );
  } );

  ngOnInit(): void {
    this.api.list().subscribe( {
      next: ( items ) => {
        this.artworks.set( items );
        this.loading.set( false );
      },
      error: () => {
        this.loading.set( false );
        this.loadError.set( this.locale.t( 'admin.catalog.loadError' ) );
      },
    } );
  }

  thumbUrl( artwork: AdminArtwork ): string | null {
    const main = artwork.photos.find( ( photo ) => photo.isMain ) ?? artwork.photos[ 0 ];
    return main?.url ?? null;
  }

  minPrice( artwork: AdminArtwork ): number | null {
    if ( artwork.options.length === 0 ) {
      return null;
    }
    return Math.min( ...artwork.options.map( ( option ) => Number( option.price ) ) );
  }

  statusLabel( status: AdminArtStatus ): string {
    return this.locale.t( `admin.status.${ status }` );
  }
}
