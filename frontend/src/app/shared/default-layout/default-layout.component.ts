import { Component, inject } from '@angular/core';

import { LocaleService } from '../../locale/locale.service';
import { HeaderComponent } from '../header/header.component';

@Component( {
  selector: 'app-default-layout',
  imports:  [ HeaderComponent ],
  template: `
    <div class="flex min-h-screen flex-col">
      <app-header />

      <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
        <ng-content />
      </main>

      <footer class="border-t border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500 sm:px-8">{{ locale.t( 'common.footer', { year } ) }}</footer>
    </div>
  `,
} )
export class DefaultLayoutComponent {
  readonly locale = inject( LocaleService );
  readonly year   = new Date().getFullYear();
}
