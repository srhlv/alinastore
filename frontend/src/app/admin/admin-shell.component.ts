import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AdminAuthService } from '../core/admin-auth.service';
import { LocaleService } from '../locale/locale.service';

@Component( {
  selector: 'app-admin-shell',
  imports:  [ RouterOutlet, RouterLink, RouterLinkActive ],
  template: `
    <div class="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <header class="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <nav class="flex flex-wrap gap-4 text-sm tracking-wide uppercase">
          <a
            routerLink="/admin/artworks"
            routerLinkActive="font-semibold text-neutral-900"
            class="text-neutral-500 hover:text-neutral-900"
          >{{ locale.t( 'admin.nav.catalog' ) }}</a>
        </nav>

        <button
          type="button"
          class="border border-neutral-300 px-3 py-2 text-sm tracking-wide uppercase hover:border-neutral-900"
          (click)="logout()"
        >
          {{ locale.t( 'admin.dashboard.logout' ) }}
        </button>
      </header>

      <router-outlet />
    </div>
  `,
} )
export class AdminShellComponent {
  private readonly auth   = inject( AdminAuthService );
  private readonly router = inject( Router );

  readonly locale = inject( LocaleService );

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl( '/admin/login' );
  }
}
