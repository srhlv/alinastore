import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { applyEach, form, FormField, min, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { concatMap, from, last, map, of, switchMap } from 'rxjs';

import {
  AdminArtStatus,
  AdminArtwork,
  AdminArtworkOptionPayload,
  AdminArtworkPayload,
  AdminArtworkPhoto,
  AdminArtworksApiService,
} from '../../core/admin-artworks-api.service';
import { LocaleService } from '../../locale/locale.service';

type OptionModel = {
  nameUk:        string;
  nameEn:        string;
  descriptionUk: string;
  descriptionEn: string;
  price:         number;
};

type ArtworkFormModel = {
  titleUk:       string;
  titleEn:       string;
  descriptionUk: string;
  descriptionEn: string;
  options:       OptionModel[];
};

const MAX_PHOTOS = 5;

function emptyOption(): OptionModel {
  return {
    nameUk:        '',
    nameEn:        '',
    descriptionUk: '',
    descriptionEn: '',
    price:         0,
  };
}

function emptyModel(): ArtworkFormModel {
  return {
    titleUk:       '',
    titleEn:       '',
    descriptionUk: '',
    descriptionEn: '',
    options:       [ emptyOption() ],
  };
}

@Component( {
  selector: 'app-admin-artwork-form-page',
  imports:  [ FormField, RouterLink ],
  template: `
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold tracking-tight">
        {{ isEdit() ? locale.t( 'admin.form.editTitle' ) : locale.t( 'admin.form.createTitle' ) }}
      </h1>
      <a routerLink="/admin/artworks" class="text-sm underline">{{ locale.t( 'admin.form.back' ) }}</a>
    </div>

    @if ( loading() ) {
      <p class="text-neutral-500">{{ locale.t( 'admin.form.loading' ) }}</p>
    } @else if ( loadError() ) {
      <p class="text-red-700" role="alert">{{ loadError() }}</p>
    } @else {
      @if ( isEdit() && artwork() ) {
        <div class="mb-6 flex flex-wrap items-center gap-2">
          <span class="text-sm text-neutral-500">{{ locale.t( 'admin.form.status' ) }}: {{ statusLabel( artwork()!.status ) }}</span>
          @if ( artwork()!.status !== 'AVAILABLE' ) {
            <button type="button" class="border border-neutral-300 px-3 py-1.5 text-xs tracking-wide uppercase hover:border-neutral-900" [disabled]="statusBusy()" (click)="setStatus( 'AVAILABLE' )">{{ locale.t( 'admin.form.markAvailable' ) }}</button>
          }
          @if ( artwork()!.status !== 'SOLD' ) {
            <button type="button" class="border border-neutral-300 px-3 py-1.5 text-xs tracking-wide uppercase hover:border-neutral-900" [disabled]="statusBusy()" (click)="setStatus( 'SOLD' )">{{ locale.t( 'admin.form.markSold' ) }}</button>
          }
          @if ( artwork()!.status !== 'DELETED' ) {
            <button type="button" class="border border-neutral-300 px-3 py-1.5 text-xs tracking-wide uppercase hover:border-neutral-900" [disabled]="statusBusy()" (click)="setStatus( 'DELETED' )">{{ locale.t( 'admin.form.markDeleted' ) }}</button>
          }
          <button
            type="button"
            class="border border-red-700 px-3 py-1.5 text-xs tracking-wide text-red-700 uppercase hover:bg-red-700 hover:text-white"
            [disabled]="deleteBusy()"
            (click)="hardDelete()"
          >
            {{ locale.t( 'admin.form.deleteForever' ) }}
          </button>
        </div>
      }

      <form class="space-y-8" (submit)="onSubmit( $event )">
        <section class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-xs tracking-wider text-neutral-500 uppercase">{{ locale.t( 'admin.form.titleUk' ) }}</span>
            <input type="text" class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" [formField]="artworkForm.titleUk" />
          </label>
          <label class="block">
            <span class="mb-1 block text-xs tracking-wider text-neutral-500 uppercase">{{ locale.t( 'admin.form.titleEn' ) }}</span>
            <input type="text" class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" [formField]="artworkForm.titleEn" />
          </label>
          <label class="block sm:col-span-2">
            <span class="mb-1 block text-xs tracking-wider text-neutral-500 uppercase">{{ locale.t( 'admin.form.descriptionUk' ) }}</span>
            <textarea rows="3" class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" [formField]="artworkForm.descriptionUk"></textarea>
          </label>
          <label class="block sm:col-span-2">
            <span class="mb-1 block text-xs tracking-wider text-neutral-500 uppercase">{{ locale.t( 'admin.form.descriptionEn' ) }}</span>
            <textarea rows="3" class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" [formField]="artworkForm.descriptionEn"></textarea>
          </label>
        </section>

        <section>
          <div class="mb-3 flex items-center justify-between gap-4">
            <h2 class="text-sm font-medium tracking-wider uppercase">{{ locale.t( 'admin.form.options' ) }}</h2>
            <button type="button" class="text-sm underline" (click)="addOption()">{{ locale.t( 'admin.form.addOption' ) }}</button>
          </div>

          <div class="space-y-4">
            @for ( option of artworkForm.options; track $index; let i = $index ) {
              <div class="space-y-3 border border-neutral-200 p-4">
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs tracking-wider text-neutral-500 uppercase">{{ locale.t( 'admin.form.optionN', { n: i + 1 } ) }}</span>
                  @if ( model().options.length > 1 ) {
                    <button type="button" class="text-xs text-red-700 underline" (click)="removeOption( i )">{{ locale.t( 'admin.form.removeOption' ) }}</button>
                  }
                </div>
                <div class="grid gap-3 sm:grid-cols-2">
                  <label class="block">
                    <span class="mb-1 block text-xs text-neutral-500">{{ locale.t( 'admin.form.optionNameUk' ) }}</span>
                    <input type="text" class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" [formField]="option.nameUk" />
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs text-neutral-500">{{ locale.t( 'admin.form.optionNameEn' ) }}</span>
                    <input type="text" class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" [formField]="option.nameEn" />
                  </label>
                  <label class="block sm:col-span-2">
                    <span class="mb-1 block text-xs text-neutral-500">{{ locale.t( 'admin.form.optionDescUk' ) }}</span>
                    <textarea rows="2" class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" [formField]="option.descriptionUk"></textarea>
                  </label>
                  <label class="block sm:col-span-2">
                    <span class="mb-1 block text-xs text-neutral-500">{{ locale.t( 'admin.form.optionDescEn' ) }}</span>
                    <textarea rows="2" class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" [formField]="option.descriptionEn"></textarea>
                  </label>
                  <label class="block">
                    <span class="mb-1 block text-xs text-neutral-500">{{ locale.t( 'admin.form.optionPrice' ) }}</span>
                    <input type="number" step="1" class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900" [formField]="option.price" />
                  </label>
                </div>
              </div>
            }
          </div>
        </section>

        <section>
          <h2 class="mb-3 text-sm font-medium tracking-wider uppercase">{{ locale.t( 'admin.form.photos' ) }}</h2>
          <p class="mb-3 text-xs text-neutral-500">{{ locale.t( 'admin.form.photosHint', { max: MAX_PHOTOS } ) }}</p>

          @if ( photos().length > 0 ) {
            <ul class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              @for ( photo of photos(); track photo.id ) {
                <li class="relative border border-neutral-200">
                  <img [src]="photo.url" alt="" class="aspect-square w-full object-cover" />
                  <div class="flex flex-col gap-1 p-2 text-xs">
                    @if ( photo.isMain ) {
                      <span class="font-medium">{{ locale.t( 'admin.form.mainPhoto' ) }}</span>
                    } @else if ( isEdit() ) {
                      <button type="button" class="underline" [disabled]="photoBusy()" (click)="setMainPhoto( photo.id )">{{ locale.t( 'admin.form.setMain' ) }}</button>
                    }
                    @if ( isEdit() ) {
                      <button type="button" class="text-red-700 underline" [disabled]="photoBusy()" (click)="deletePhoto( photo.id )">{{ locale.t( 'admin.form.removePhoto' ) }}</button>
                    }
                  </div>
                </li>
              }
            </ul>
          }

          @if ( pendingFiles().length > 0 ) {
            <ul class="mb-4 space-y-1 text-sm text-neutral-600">
              @for ( file of pendingFiles(); track file.name + $index; let i = $index ) {
                <li class="flex items-center justify-between gap-2">
                  <span>{{ file.name }}</span>
                  <button type="button" class="text-xs text-red-700 underline" (click)="removePending( i )">{{ locale.t( 'admin.form.removePhoto' ) }}</button>
                </li>
              }
            </ul>
          }

          @if ( canAddPhotos() ) {
            <label class="inline-block cursor-pointer border border-neutral-300 px-3 py-2 text-sm tracking-wide uppercase hover:border-neutral-900">
              {{ locale.t( 'admin.form.uploadPhotos' ) }}
              <input type="file" accept="image/*" multiple class="hidden" (change)="onFilesSelected( $event )" />
            </label>
          }
        </section>

        @if ( saveError() ) {
          <p class="text-sm text-red-700" role="alert">{{ saveError() }}</p>
        }

        <button
          type="submit"
          class="bg-neutral-900 px-6 py-3 text-sm tracking-wide text-white uppercase disabled:cursor-not-allowed disabled:bg-neutral-300"
          [disabled]="artworkForm().invalid() || saving()"
        >
          {{ locale.t( 'admin.form.save' ) }}
        </button>
      </form>
    }
  `,
} )
export class AdminArtworkFormPageComponent implements OnInit {
  private readonly api    = inject( AdminArtworksApiService );
  private readonly router = inject( Router );

  readonly locale = inject( LocaleService );
  readonly id     = input<string>();

  readonly MAX_PHOTOS = MAX_PHOTOS;

  readonly loading     = signal( false );
  readonly loadError   = signal<string | null>( null );
  readonly saving      = signal( false );
  readonly saveError   = signal<string | null>( null );
  readonly statusBusy  = signal( false );
  readonly deleteBusy  = signal( false );
  readonly photoBusy   = signal( false );
  readonly artwork     = signal<AdminArtwork | null>( null );
  readonly photos      = signal<AdminArtworkPhoto[]>( [] );
  readonly pendingFiles = signal<File[]>( [] );

  readonly model = signal<ArtworkFormModel>( emptyModel() );

  readonly artworkForm = form( this.model, ( schema ) => {
    required( schema.titleUk );
    required( schema.titleEn );
    minLength( schema.options, 1 );
    applyEach( schema.options, ( option ) => {
      required( option.nameUk );
      required( option.nameEn );
      required( option.price );
      min( option.price, 0 );
    } );
  } );

  readonly isEdit = computed( () => {
    const routeId = this.id();
    return !!routeId && routeId !== 'new';
  } );

  readonly canAddPhotos = computed( () => {
    return this.photos().length + this.pendingFiles().length < MAX_PHOTOS;
  } );

  ngOnInit(): void {
    if ( !this.isEdit() ) {
      return;
    }

    const artworkId = this.id()!;
    this.loading.set( true );

    this.api.list().subscribe( {
      next: ( items ) => {
        const found = items.find( ( item ) => item.id === artworkId );
        if ( !found ) {
          this.loading.set( false );
          this.loadError.set( this.locale.t( 'admin.form.loadError' ) );
          return;
        }
        this.applyArtwork( found );
        this.loading.set( false );
      },
      error: () => {
        this.loading.set( false );
        this.loadError.set( this.locale.t( 'admin.form.loadError' ) );
      },
    } );
  }

  addOption(): void {
    this.model.update( ( current ) => ( {
      ...current,
      options: [ ...current.options, emptyOption() ],
    } ) );
  }

  removeOption( index: number ): void {
    this.model.update( ( current ) => ( {
      ...current,
      options: current.options.filter( ( _, i ) => i !== index ),
    } ) );
  }

  onFilesSelected( event: Event ): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from( input.files ?? [] );
    input.value = '';

    if ( files.length === 0 ) {
      return;
    }

    const room = MAX_PHOTOS - this.photos().length - this.pendingFiles().length;
    if ( room <= 0 ) {
      return;
    }

    const next = files.slice( 0, room );

    if ( this.isEdit() ) {
      this.uploadAndAttach( next );
      return;
    }

    this.pendingFiles.update( ( current ) => [ ...current, ...next ] );
  }

  removePending( index: number ): void {
    this.pendingFiles.update( ( current ) => current.filter( ( _, i ) => i !== index ) );
  }

  deletePhoto( photoId: string ): void {
    const artworkId = this.artwork()?.id;
    if ( !artworkId || this.photoBusy() ) {
      return;
    }

    this.photoBusy.set( true );
    this.api.removePhoto( artworkId, photoId ).subscribe( {
      next: () => {
        this.photos.update( ( current ) => {
          const removed = current.find( ( photo ) => photo.id === photoId );
          const remaining = current.filter( ( photo ) => photo.id !== photoId );

          if ( !removed?.isMain || remaining.length === 0 ) {
            return remaining;
          }

          const nextMain = [ ...remaining ].sort(
            ( a, b ) => a.sortOrder - b.sortOrder,
          )[ 0 ];

          return remaining.map( ( photo ) => ( {
            ...photo,
            isMain: photo.id === nextMain.id,
          } ) );
        } );
        this.photoBusy.set( false );
      },
      error: () => {
        this.photoBusy.set( false );
        this.saveError.set( this.locale.t( 'admin.form.photoError' ) );
      },
    } );
  }

  setMainPhoto( photoId: string ): void {
    const artworkId = this.artwork()?.id;
    if ( !artworkId || this.photoBusy() ) {
      return;
    }

    this.photoBusy.set( true );
    this.api.updatePhoto( artworkId, photoId, { isMain: true } ).subscribe( {
      next: () => {
        this.photos.update( ( current ) =>
          current.map( ( photo ) => ( {
            ...photo,
            isMain: photo.id === photoId,
          } ) ),
        );
        this.photoBusy.set( false );
      },
      error: () => {
        this.photoBusy.set( false );
        this.saveError.set( this.locale.t( 'admin.form.photoError' ) );
      },
    } );
  }

  setStatus( status: AdminArtStatus ): void {
    const current = this.artwork();
    if ( !current || this.statusBusy() ) {
      return;
    }

    this.statusBusy.set( true );
    this.api.updateStatus( current.id, status ).subscribe( {
      next: ( updated ) => {
        this.artwork.set( updated );
        this.photos.set( updated.photos );
        this.statusBusy.set( false );
      },
      error: () => {
        this.statusBusy.set( false );
        this.saveError.set( this.locale.t( 'admin.form.statusError' ) );
      },
    } );
  }

  hardDelete(): void {
    const current = this.artwork();
    if ( !current || this.deleteBusy() ) {
      return;
    }

    if ( !window.confirm( this.locale.t( 'admin.form.deleteForeverConfirm' ) ) ) {
      return;
    }

    this.deleteBusy.set( true );
    this.saveError.set( null );

    this.api.hardDelete( current.id ).subscribe( {
      next: () => {
        this.deleteBusy.set( false );
        void this.router.navigateByUrl( '/admin/artworks' );
      },
      error: ( err: unknown ) => {
        this.deleteBusy.set( false );
        const status = err instanceof HttpErrorResponse ? err.status : 0;
        this.saveError.set(
          status === 409
            ? this.locale.t( 'admin.form.deleteForeverBlocked' )
            : this.locale.t( 'admin.form.deleteForeverError' ),
        );
      },
    } );
  }

  statusLabel( status: AdminArtStatus ): string {
    return this.locale.t( `admin.status.${ status }` );
  }

  onSubmit( event: Event ): void {
    event.preventDefault();
    this.artworkForm().markAsTouched();

    if ( this.artworkForm().invalid() || this.saving() ) {
      return;
    }

    const payload = this.toPayload( this.model() );
    this.saving.set( true );
    this.saveError.set( null );

    if ( this.isEdit() ) {
      const artworkId = this.id()!;
      this.api.update( artworkId, payload ).subscribe( {
        next: ( updated ) => {
          this.applyArtwork( updated );
          this.saving.set( false );
          void this.router.navigateByUrl( '/admin/artworks' );
        },
        error: () => {
          this.saving.set( false );
          this.saveError.set( this.locale.t( 'admin.form.saveError' ) );
        },
      } );
      return;
    }

    const pending = this.pendingFiles();

    this.api.create( payload ).pipe(
      switchMap( ( created ) => {
        if ( pending.length === 0 ) {
          return of( created );
        }

        return from( pending ).pipe(
          concatMap( ( file, index ) =>
            this.api.upload( file ).pipe(
              switchMap( ( { url } ) =>
                this.api.addPhoto( created.id, {
                  url,
                  isMain:    index === 0,
                  sortOrder: index,
                } ),
              ),
            ),
          ),
          last(),
          map( () => created ),
        );
      } ),
    ).subscribe( {
      next: () => {
        this.saving.set( false );
        void this.router.navigateByUrl( '/admin/artworks' );
      },
      error: () => {
        this.saving.set( false );
        this.saveError.set( this.locale.t( 'admin.form.saveError' ) );
      },
    } );
  }

  private uploadAndAttach( files: File[] ): void {
    const artworkId = this.artwork()?.id;
    if ( !artworkId ) {
      return;
    }

    this.photoBusy.set( true );
    const startIndex = this.photos().length;
    const noPhotos   = startIndex === 0;

    from( files ).pipe(
      concatMap( ( file, index ) =>
        this.api.upload( file ).pipe(
          switchMap( ( { url } ) =>
            this.api.addPhoto( artworkId, {
              url,
              isMain:    noPhotos && index === 0,
              sortOrder: startIndex + index,
            } ),
          ),
        ),
      ),
    ).subscribe( {
      next: ( photo ) => {
        this.photos.update( ( current ) => [ ...current, photo ] );
      },
      error: () => {
        this.photoBusy.set( false );
        this.saveError.set( this.locale.t( 'admin.form.photoError' ) );
      },
      complete: () => {
        this.photoBusy.set( false );
      },
    } );
  }

  private applyArtwork( artwork: AdminArtwork ): void {
    this.artwork.set( artwork );
    this.photos.set( artwork.photos );
    this.model.set( {
      titleUk:       artwork.titleUk,
      titleEn:       artwork.titleEn,
      descriptionUk: artwork.descriptionUk ?? '',
      descriptionEn: artwork.descriptionEn ?? '',
      options:       artwork.options.length > 0
        ? artwork.options.map( ( option ) => ( {
          nameUk:        option.nameUk,
          nameEn:        option.nameEn,
          descriptionUk: option.descriptionUk ?? '',
          descriptionEn: option.descriptionEn ?? '',
          price:         Number( option.price ),
        } ) )
        : [ emptyOption() ],
    } );
  }

  private toPayload( model: ArtworkFormModel ): AdminArtworkPayload {
    const options: AdminArtworkOptionPayload[] = model.options.map( ( option ) => ( {
      nameUk:        option.nameUk.trim(),
      nameEn:        option.nameEn.trim(),
      descriptionUk: option.descriptionUk.trim() || undefined,
      descriptionEn: option.descriptionEn.trim() || undefined,
      price:         Number( option.price ),
    } ) );

    return {
      titleUk:       model.titleUk.trim(),
      titleEn:       model.titleEn.trim(),
      descriptionUk: model.descriptionUk.trim() || undefined,
      descriptionEn: model.descriptionEn.trim() || undefined,
      options,
    };
  }
}
