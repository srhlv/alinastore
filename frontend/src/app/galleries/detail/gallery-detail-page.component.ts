import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  ArtworksApiService,
  PublicArtworkDetail,
  PublicArtworkOption,
} from '../../core/artworks-api.service';
import { CartService } from '../../core/cart.service';
import { LocaleService } from '../../locale/locale.service';
import { DefaultLayoutComponent } from '../../shared/default-layout/default-layout.component';
import { LightboxComponent } from '../../shared/lightbox/lightbox.component';

@Component( {
  selector: 'app-gallery-detail-page',
  imports:  [ DefaultLayoutComponent, LightboxComponent, RouterLink ],
  template: `
    <app-default-layout>
      @if ( loadError() ) {
        <p class="text-neutral-600">{{ locale.t( 'product.loadError' ) }}</p>
        <a routerLink="/gallery" class="mt-4 inline-block text-sm underline">{{ locale.t( 'product.backToGallery' ) }}</a>
      } @else if ( !artwork() ) {
        <p class="text-neutral-600">{{ locale.t( 'product.loading' ) }}</p>
      } @else {
        <div class="grid gap-10 lg:grid-cols-2">
          <div>
            <button
              type="button"
              class="block w-full cursor-zoom-in overflow-hidden bg-neutral-200"
              (click)="openLightbox()"
            >
              @if ( activePhotoUrl() ) {
                <img [src]="activePhotoUrl()" [alt]="title()" class="aspect-[3/4] w-full object-cover" />
              } @else {
                <div class="aspect-[3/4] w-full bg-neutral-200"></div>
              }
            </button>

            @if ( photoUrls().length > 1 ) {
              <div class="mt-3 flex flex-wrap gap-2">
                @for ( photo of artwork()!.photos; track photo.id; let i = $index ) {
                  <button
                    type="button"
                    class="h-16 w-16 overflow-hidden border border-transparent"
                    [class.border-neutral-900]="i === photoIndex()"
                    (click)="photoIndex.set( i )"
                  >
                    <img [src]="photo.url" alt="" class="h-full w-full object-cover" />
                  </button>
                }
              </div>
            }

            @if ( selectedOptionDescription() ) {
              <p class="mt-6 text-sm leading-relaxed text-neutral-600">{{ selectedOptionDescription() }}</p>
            }
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-3">
              <h1 class="text-2xl font-semibold tracking-tight">{{ title() }}</h1>
              @if ( artwork()!.status === 'SOLD' ) {
                <span class="bg-neutral-900 px-2 py-1 text-xs tracking-wide text-white uppercase">{{ locale.t( 'common.sold' ) }}</span>
              }
            </div>

            @if ( artwork()!.options.length > 0 ) {
              <fieldset class="mt-8">
                <legend class="mb-3 text-xs tracking-[0.2em] text-neutral-500 uppercase">{{ locale.t( 'product.chooseOption' ) }}</legend>
                <div class="space-y-2">
                  @for ( option of artwork()!.options; track option.id ) {
                    <label class="flex cursor-pointer items-center gap-3 border border-neutral-200 px-3 py-3 text-sm hover:border-neutral-400">
                      <input
                        type="radio"
                        class="accent-neutral-900"
                        name="artwork-option"
                        [value]="option.id"
                        [checked]="selectedOptionId() === option.id"
                        (change)="selectedOptionId.set( option.id )"
                      />
                      <span class="flex-1">{{ optionName( option ) }}</span>
                      <span class="text-neutral-500">{{ formatPrice( option.price ) }} ₴</span>
                    </label>
                  }
                </div>
              </fieldset>
            }

            <button
              type="button"
              class="mt-8 w-full bg-neutral-900 px-4 py-3 text-sm tracking-wide text-white uppercase disabled:cursor-not-allowed disabled:bg-neutral-300"
              [disabled]="!canAddToCart()"
              (click)="addToCart()"
            >
              {{ locale.t( 'common.addToCart' ) }}
            </button>

            @if ( addedHint() ) {
              <p class="mt-3 text-sm text-neutral-500">{{ locale.t( 'product.addedToCart' ) }}</p>
            }
          </div>
        </div>
      }

      <app-lightbox
        [photos]="photoUrls()"
        [open]="lightboxOpen()"
        [index]="lightboxIndex()"
        (close)="lightboxOpen.set( false )"
        (indexChange)="onLightboxIndex( $event )"
      />
    </app-default-layout>
  `,
} )
export class GalleryDetailPageComponent {
  private readonly artworksApi = inject( ArtworksApiService );
  private readonly cart        = inject( CartService );

  readonly id     = input.required<string>();
  readonly locale = inject( LocaleService );

  readonly artwork          = signal<PublicArtworkDetail | null>( null );
  readonly loadError        = signal( false );
  readonly selectedOptionId = signal<string | null>( null );
  readonly photoIndex       = signal( 0 );
  readonly lightboxOpen     = signal( false );
  readonly lightboxIndex    = signal( 0 );
  readonly addedHint        = signal( false );

  readonly photoUrls = computed( () =>
    ( this.artwork()?.photos ?? [] ).map( ( photo ) => photo.url ),
  );

  readonly activePhotoUrl = computed( () => {
    const urls = this.photoUrls();
    return urls[ this.photoIndex() ] ?? urls[ 0 ] ?? null;
  } );

  readonly title = computed( () => {
    const current = this.artwork();
    return current ? this.locale.localizedField( current, 'title' ) : '';
  } );

  readonly selectedOption = computed( () => {
    const current = this.artwork();
    const optionId = this.selectedOptionId();
    if ( !current || !optionId ) {
      return null;
    }
    return current.options.find( ( option ) => option.id === optionId ) ?? null;
  } );

  readonly selectedOptionDescription = computed( () => {
    const option = this.selectedOption();
    return option ? this.locale.localizedField( option, 'description' ) : '';
  } );

  readonly canAddToCart = computed( () => {
    const current = this.artwork();
    return !!current
      && current.status === 'AVAILABLE'
      && !!this.selectedOption();
  } );

  constructor() {
    effect( ( onCleanup ) => {
      const artworkId = this.id();
      this.artwork.set( null );
      this.loadError.set( false );
      this.selectedOptionId.set( null );
      this.photoIndex.set( 0 );
      this.addedHint.set( false );

      const subscription = this.artworksApi.getArtwork( artworkId ).subscribe( {
        next: ( detail ) => {
          this.artwork.set( detail );
          const mainIndex = detail.photos.findIndex( ( photo ) => photo.isMain );
          this.photoIndex.set( mainIndex >= 0 ? mainIndex : 0 );
          this.selectedOptionId.set( detail.options[ 0 ]?.id ?? null );
        },
        error: () => {
          this.loadError.set( true );
        },
      } );

      onCleanup( () => subscription.unsubscribe() );
    } );
  }

  optionName( option: PublicArtworkOption ): string {
    return this.locale.localizedField( option, 'name' );
  }

  formatPrice( price: number | string ): string {
    return new Intl.NumberFormat(
      this.locale.isUkLocale() ? 'uk-UA' : 'en-US',
    ).format( Number( price ) );
  }

  openLightbox(): void {
    if ( this.photoUrls().length === 0 ) {
      return;
    }
    this.lightboxIndex.set( this.photoIndex() );
    this.lightboxOpen.set( true );
  }

  onLightboxIndex( index: number ): void {
    this.lightboxIndex.set( index );
    this.photoIndex.set( index );
  }

  addToCart(): void {
    const current = this.artwork();
    const option  = this.selectedOption();
    if ( !current || !option || current.status !== 'AVAILABLE' ) {
      return;
    }

    this.cart.addItem( {
      artworkId:    current.id,
      optionId:     option.id,
      artworkTitle: this.title(),
      optionName:   this.optionName( option ),
      optionPrice:  Number( option.price ),
      photoUrl:     this.activePhotoUrl() ?? '',
      quantity:     1,
    } );

    this.addedHint.set( true );
  }
}
