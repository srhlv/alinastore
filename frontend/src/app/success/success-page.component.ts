import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocaleService } from '../locale/locale.service';
import { DefaultLayoutComponent } from '../shared/default-layout/default-layout.component';

@Component( {
  selector: 'app-success-page',
  imports:  [ DefaultLayoutComponent, RouterLink ],
  template: `
    <app-default-layout>
      <div class="mx-auto max-w-lg py-16 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">{{ locale.t( 'success.title' ) }}</h1>
        <p class="mt-4 text-neutral-600">{{ locale.t( 'success.message' ) }}</p>
        <a routerLink="/gallery" class="mt-8 inline-block bg-neutral-900 px-6 py-3 text-sm tracking-wide text-white uppercase">{{ locale.t( 'success.toGallery' ) }}</a>
      </div>
    </app-default-layout>
  `,
} )
export class SuccessPageComponent {
  readonly locale = inject( LocaleService );
}
