import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocaleService } from '../locale/locale.service';
import { DefaultLayoutComponent } from '../shared/default-layout/default-layout.component';

const ABOUT_PHOTO_URL
  = 'https://prfbmhfnsjmfwfewebob.supabase.co/storage/v1/object/public/assets/alina_about.jpeg';

@Component( {
  selector: 'app-about-page',
  imports:  [ DefaultLayoutComponent, RouterLink ],
  template: `
    <app-default-layout>
      <h1 class="mb-8 text-xs tracking-[0.3em] text-neutral-500 uppercase">{{ locale.t( 'about.title' ) }}</h1>

      <div class="grid gap-10 lg:grid-cols-2">
        <img
          [src]="aboutPhotoUrl"
          [alt]="locale.t( 'about.photoAlt' )"
          class="aspect-[3/4] w-full object-cover bg-neutral-200"
        />

        <div>
          <h2 class="text-2xl font-semibold tracking-tight">{{ locale.t( 'about.name' ) }}</h2>
          <p class="mt-4 text-neutral-700">{{ locale.t( 'about.lead' ) }}</p>
          <p class="mt-4 text-neutral-600">{{ locale.t( 'about.p1' ) }}</p>
          <p class="mt-4 text-neutral-600">{{ locale.t( 'about.p2' ) }}</p>
          <a routerLink="/gallery" class="mt-8 inline-block border border-neutral-900 px-5 py-2 text-sm uppercase tracking-wide hover:bg-neutral-900 hover:text-white">{{ locale.t( 'about.toGallery' ) }}</a>
        </div>
      </div>
    </app-default-layout>
  `,
} )
export class AboutPageComponent {
  readonly locale        = inject( LocaleService );
  readonly aboutPhotoUrl = ABOUT_PHOTO_URL;
}
