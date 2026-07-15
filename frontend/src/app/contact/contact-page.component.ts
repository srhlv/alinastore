import { Component, inject } from '@angular/core';

import { LocaleService } from '../locale/locale.service';
import { DefaultLayoutComponent } from '../shared/default-layout/default-layout.component';

@Component( {
  selector: 'app-contact-page',
  imports:  [ DefaultLayoutComponent ],
  template: `
    <app-default-layout>
      <h1 class="mb-8 text-xs tracking-[0.3em] text-neutral-500 uppercase">{{ locale.t( 'contact.title' ) }}</h1>

      <p class="max-w-2xl text-neutral-700">{{ locale.t( 'contact.intro' ) }}</p>

      <ul class="mt-10 space-y-6">
        @for ( item of locale.messages().contact.items; track item.label ) {
          <li>
            <div class="text-xs tracking-wider text-neutral-500 uppercase">{{ item.label }}</div>
            @if ( item.href ) {
              <a
                [href]="item.href"
                class="mt-1 inline-block text-sm underline"
                [attr.target]="item.href.startsWith( 'http' ) ? '_blank' : null"
                [attr.rel]="item.href.startsWith( 'http' ) ? 'noopener noreferrer' : null"
              >{{ item.value }}</a>
            } @else {
              <div class="mt-1 text-sm">{{ item.value }}</div>
            }
          </li>
        }
      </ul>

      <p class="mt-10 max-w-2xl text-sm text-neutral-500">{{ locale.t( 'contact.note' ) }}</p>
    </app-default-layout>
  `,
} )
export class ContactPageComponent {
  readonly locale = inject( LocaleService );
}
