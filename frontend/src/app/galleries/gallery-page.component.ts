import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ArtworksApiService,
  PublicArtworkListItem,
} from '../core/artworks-api.service';
import { LocaleService } from '../locale/locale.service';
import { DefaultLayoutComponent } from '../shared/default-layout/default-layout.component';

@Component( {
  selector: 'app-gallery-page',
  imports:  [ DefaultLayoutComponent, RouterLink ],
  template: `
    <app-default-layout>
      <h1 class="mb-8 text-xs tracking-[0.3em] text-neutral-500 uppercase">{{ locale.t( 'gallery.title' ) }}</h1>

      @if ( loadError() ) {
        <p class="text-neutral-600">{{ locale.t( 'gallery.loadError' ) }}</p>
      } @else if ( !loaded() ) {
        <p class="text-neutral-600">{{ locale.t( 'gallery.loading' ) }}</p>
      } @else if ( artworks().length === 0 ) {
        <p class="text-neutral-600">{{ locale.t( 'gallery.empty' ) }}</p>
      } @else {
        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for ( artwork of artworks(); track artwork.id ) {
            <a [routerLink]="[ '/gallery', artwork.id ]" class="group block text-inherit no-underline">
              <div class="relative aspect-[3/4] overflow-hidden bg-neutral-200">
                @if ( artwork.thumbnailUrl ) {
                  <img
                    [src]="artwork.thumbnailUrl"
                    [alt]="titleFor( artwork )"
                    class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                }
                @if ( artwork.status === 'SOLD' ) {
                  <span class="absolute top-3 left-3 bg-neutral-900 px-2 py-1 text-xs tracking-wide text-white uppercase">{{ locale.t( 'common.sold' ) }}</span>
                }
              </div>
              <div class="pt-3">
                <div class="text-sm">{{ titleFor( artwork ) }}</div>
                @if ( artwork.minOptionPrice !== null ) {
                  <div class="mt-0.5 text-sm text-neutral-500">{{ locale.t( 'common.fromPrice', { price: formatPrice( artwork.minOptionPrice ) } ) }}</div>
                }
              </div>
            </a>
          }
        </div>
      }
    </app-default-layout>
  `,
} )
export class GalleryPageComponent {
  private readonly artworksApi = inject( ArtworksApiService );

  readonly locale    = inject( LocaleService );
  readonly artworks  = signal<PublicArtworkListItem[]>( [] );
  readonly loaded    = signal( false );
  readonly loadError = signal( false );

  constructor() {
    this.artworksApi.getArtworks().subscribe( {
      next: ( items ) => {
        this.artworks.set( items );
        this.loaded.set( true );
      },
      error: () => {
        this.loadError.set( true );
        this.loaded.set( true );
      },
    } );
  }

  titleFor( artwork: PublicArtworkListItem ): string {
    return this.locale.localizedField( artwork, 'title' );
  }

  formatPrice( price: number ): string {
    return new Intl.NumberFormat(
      this.locale.isUkLocale() ? 'uk-UA' : 'en-US',
    ).format( price );
  }
}
