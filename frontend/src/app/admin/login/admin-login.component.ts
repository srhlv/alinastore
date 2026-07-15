import { Component, inject, OnInit, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Router } from '@angular/router';

import { AdminAuthService } from '../../core/admin-auth.service';
import { LocaleService } from '../../locale/locale.service';

type LoginModel = {
  username: string;
  password: string;
};

@Component( {
  selector: 'app-admin-login',
  imports:  [ FormField ],
  template: `
    <div class="flex min-h-screen items-center justify-center px-4">
      <div class="w-full max-w-sm">
        <h1 class="mb-2 text-2xl font-semibold tracking-tight">{{ locale.t( 'admin.login.title' ) }}</h1>
        <p class="mb-8 text-sm text-neutral-500">{{ locale.t( 'admin.login.subtitle' ) }}</p>

        <form class="space-y-4" (submit)="onSubmit( $event )">
          <label class="block">
            <span class="mb-1 block text-xs tracking-wider text-neutral-500 uppercase">{{ locale.t( 'admin.login.username' ) }}</span>
            <input
              type="text"
              class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              autocomplete="username"
              [formField]="loginForm.username"
            />
          </label>

          <label class="block">
            <span class="mb-1 block text-xs tracking-wider text-neutral-500 uppercase">{{ locale.t( 'admin.login.password' ) }}</span>
            <input
              type="password"
              class="w-full border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
              autocomplete="current-password"
              [formField]="loginForm.password"
            />
          </label>

          @if ( loginError() ) {
            <p class="text-sm text-red-700" role="alert">{{ loginError() }}</p>
          }

          <button
            type="submit"
            class="w-full bg-neutral-900 px-4 py-3 text-sm tracking-wide text-white uppercase disabled:cursor-not-allowed disabled:bg-neutral-300"
            [disabled]="loginForm().invalid() || submitting()"
          >
            {{ locale.t( 'admin.login.submit' ) }}
          </button>
        </form>
      </div>
    </div>
  `,
} )
export class AdminLoginComponent implements OnInit {
  private readonly auth   = inject( AdminAuthService );
  private readonly router = inject( Router );

  readonly locale = inject( LocaleService );

  readonly submitting = signal( false );
  readonly loginError = signal<string | null>( null );

  readonly loginModel = signal<LoginModel>( {
    username: '',
    password: '',
  } );

  readonly loginForm = form( this.loginModel, ( schema ) => {
    required( schema.username );
    required( schema.password );
  } );

  ngOnInit(): void {
    if ( this.auth.isAuthenticated() ) {
      void this.router.navigateByUrl( '/admin/artworks' );
    }
  }

  onSubmit( event: Event ): void {
    event.preventDefault();
    this.loginForm().markAsTouched();

    if ( this.loginForm().invalid() || this.submitting() ) {
      return;
    }

    const { username, password } = this.loginModel();
    this.submitting.set( true );
    this.loginError.set( null );

    this.auth.login( {
      username: username.trim(),
      password,
    } ).subscribe( {
      next: () => {
        void this.router.navigateByUrl( '/admin/artworks' );
      },
      error: () => {
        this.submitting.set( false );
        this.loginError.set( this.locale.t( 'admin.login.error' ) );
      },
    } );
  }
}
