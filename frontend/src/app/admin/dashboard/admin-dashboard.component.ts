import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AdminAuthService } from '../../core/admin-auth.service';
import { LocaleService } from '../../locale/locale.service';

@Component( {
  selector: 'app-admin-dashboard',
  template: `
    <div class="mx-auto max-w-3xl px-4 py-10 sm:px-8">
      <div class="mb-8 flex items-center justify-between gap-4">
        <h1 class="text-2xl font-semibold tracking-tight">{{ locale.t( 'admin.dashboard.title' ) }}</h1>
        <button
          type="button"
          class="border border-neutral-300 px-3 py-2 text-sm tracking-wide uppercase hover:border-neutral-900"
          (click)="logout()"
        >
          {{ locale.t( 'admin.dashboard.logout' ) }}
        </button>
      </div>

      <p class="text-neutral-600">{{ locale.t( 'admin.dashboard.placeholder' ) }}</p>
    </div>
  `,
} )
export class AdminDashboardComponent {
  private readonly auth   = inject( AdminAuthService );
  private readonly router = inject( Router );

  readonly locale = inject( LocaleService );

  logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl( '/admin/login' );
  }
}
