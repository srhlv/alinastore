import { Component } from '@angular/core';

import { DefaultLayoutComponent } from '../shared/default-layout/default-layout.component';

@Component( {
  selector: 'app-gallery-page',
  imports:  [ DefaultLayoutComponent ],
  template: `
    <app-default-layout>
      <h1 class="text-2xl font-semibold tracking-tight">Gallery</h1>
      <p class="mt-2 text-neutral-600">Catalog placeholder — step 13.</p>
    </app-default-layout>
  `,
} )
export class GalleryPageComponent {}
