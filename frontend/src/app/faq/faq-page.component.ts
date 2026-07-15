import { Component, inject } from '@angular/core';

import { LocaleService } from '../locale/locale.service';
import { DefaultLayoutComponent } from '../shared/default-layout/default-layout.component';

@Component( {
  selector: 'app-faq-page',
  imports:  [ DefaultLayoutComponent ],
  template: `
    <app-default-layout>
      <h1 class="mb-8 text-xs tracking-[0.3em] text-neutral-500 uppercase">{{ locale.t( 'faq.title' ) }}</h1>

      <dl class="max-w-2xl space-y-8">
        @for ( item of locale.messages().faq.items; track item.q ) {
          <div>
            <dt class="text-sm font-medium">{{ item.q }}</dt>
            <dd class="mt-2 text-sm leading-relaxed text-neutral-600">{{ item.a }}</dd>
          </div>
        }
      </dl>
    </app-default-layout>
  `,
} )
export class FaqPageComponent {
  readonly locale = inject( LocaleService );
}
