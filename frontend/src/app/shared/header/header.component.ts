import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { CartService } from '../../core/cart.service';
import { LocaleService } from '../../locale/locale.service';

const LOGO_URL
  = 'https://prfbmhfnsjmfwfewebob.supabase.co/storage/v1/object/public/prototype/alina-logo-no-white.png';

@Component( {
  selector: 'app-header',
  imports:  [ RouterLink, RouterLinkActive ],
  template: `
    <header class="border-b border-neutral-200 px-4 py-4 sm:px-8">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <a routerLink="/" class="flex items-center gap-2">
          <img [src]="logoUrl" [alt]="locale.t( 'brand.logoAlt' )" class="h-8 w-auto" />
          <span class="text-sm font-semibold tracking-wide uppercase">{{ locale.t( 'brand.name' ) }}</span>
        </a>

        <nav class="flex flex-wrap items-center gap-4 text-sm">
          <a routerLink="/gallery" routerLinkActive="font-semibold" class="hover:underline">{{ locale.t( 'nav.gallery' ) }}</a>
          <a routerLink="/about" routerLinkActive="font-semibold" class="hover:underline">{{ locale.t( 'nav.about' ) }}</a>
          <a routerLink="/contact" routerLinkActive="font-semibold" class="hover:underline">{{ locale.t( 'nav.contact' ) }}</a>
          <a routerLink="/faq" routerLinkActive="font-semibold" class="hover:underline">{{ locale.t( 'nav.faq' ) }}</a>
          <a routerLink="/cart" routerLinkActive="font-semibold" class="hover:underline">{{ locale.t( 'nav.cart' ) }} ({{ cart.itemCount() }})</a>

          <span class="flex gap-1 text-xs tracking-wider text-neutral-500 uppercase">
            <button
              type="button"
              class="hover:text-neutral-900"
              [class.font-semibold]="locale.isUkLocale()"
              [class.text-neutral-900]="locale.isUkLocale()"
              (click)="locale.setLocale( 'uk' )"
            >
              UA
            </button>
            <span aria-hidden="true">/</span>
            <button
              type="button"
              class="hover:text-neutral-900"
              [class.font-semibold]="locale.isEnLocale()"
              [class.text-neutral-900]="locale.isEnLocale()"
              (click)="locale.setLocale( 'en' )"
            >
              EN
            </button>
          </span>
        </nav>
      </div>
    </header>
  `,
} )
export class HeaderComponent {
  readonly cart    = inject( CartService );
  readonly locale  = inject( LocaleService );
  readonly logoUrl = LOGO_URL;
}
