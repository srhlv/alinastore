import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { CartService } from '../../core/cart.service';
import { LocaleService } from '../../locale/locale.service';

@Component( {
  selector: 'app-default-layout',
  imports:  [ RouterLink, RouterLinkActive ],
  template: `
    <div class="flex min-h-screen flex-col">
      <header class="border-b border-neutral-200 px-4 py-4 sm:px-8">
        <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <a routerLink="/" class="text-sm font-semibold tracking-wide uppercase">Alina Levandovska Art</a>

          <nav class="flex flex-wrap items-center gap-4 text-sm">
            <a routerLink="/gallery" routerLinkActive="font-semibold" class="hover:underline">Gallery</a>
            <a routerLink="/about" routerLinkActive="font-semibold" class="hover:underline">About</a>
            <a routerLink="/contact" routerLinkActive="font-semibold" class="hover:underline">Contact</a>
            <a routerLink="/faq" routerLinkActive="font-semibold" class="hover:underline">FAQ</a>
            <a routerLink="/cart" routerLinkActive="font-semibold" class="hover:underline">Cart ({{ cart.itemCount() }})</a>

            <span class="flex gap-1 text-xs tracking-wider text-neutral-500 uppercase">
              <button
                type="button"
                class="hover:text-neutral-900"
                [class.font-semibold]="localeService.isUkLocale()"
                [class.text-neutral-900]="localeService.isUkLocale()"
                (click)="localeService.setLocale( 'uk' )"
              >
                UA
              </button>
              <span aria-hidden="true">/</span>
              <button
                type="button"
                class="hover:text-neutral-900"
                [class.font-semibold]="localeService.isEnLocale()"
                [class.text-neutral-900]="localeService.isEnLocale()"
                (click)="localeService.setLocale( 'en' )"
              >
                EN
              </button>
            </span>
          </nav>
        </div>
      </header>

      <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
        <ng-content />
      </main>

      <footer class="border-t border-neutral-200 px-4 py-6 text-center text-sm text-neutral-500 sm:px-8">© {{ year }} alina art studio</footer>
    </div>
  `,
} )
export class DefaultLayoutComponent {
  readonly cart          = inject( CartService );
  readonly localeService = inject( LocaleService );
  readonly year          = new Date().getFullYear();
}
