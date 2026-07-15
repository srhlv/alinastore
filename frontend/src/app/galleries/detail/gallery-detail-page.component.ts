import { Component, input, signal } from '@angular/core';

import { DefaultLayoutComponent } from '../../shared/default-layout/default-layout.component';

@Component( {
  selector: 'app-gallery-detail-page',
  imports:  [ DefaultLayoutComponent ],
  template: `
    <app-default-layout>
      <h1 class="text-2xl font-semibold tracking-tight">Artwork</h1>
      <p class="mt-2 text-neutral-600">Detail placeholder — step 14. id={{ id() }}</p>
      <p class="mt-2 text-sm text-neutral-500">Selected option (signal): {{ selectedOptionId() ?? 'none' }}</p>
    </app-default-layout>
  `,
} )
export class GalleryDetailPageComponent {
  readonly id               = input.required<string>();
  readonly selectedOptionId = signal<string | null>( null );
}
