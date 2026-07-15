import { computed, Injectable, signal } from '@angular/core';

export type AppLocale = 'uk' | 'en';

const STORAGE_KEY = 'lang';

@Injectable( { providedIn: 'root' } )
export class LocaleService {
  private readonly localeSignal = signal<AppLocale>( this.readStoredLocale() );

  readonly locale     = this.localeSignal.asReadonly();
  readonly isUkLocale = computed( () => this.localeSignal() === 'uk' );
  readonly isEnLocale = computed( () => this.localeSignal() === 'en' );

  setLocale( locale: AppLocale ): void {
    this.localeSignal.set( locale );
    localStorage.setItem( STORAGE_KEY, locale );
  }

  private readStoredLocale(): AppLocale {
    const stored = localStorage.getItem( STORAGE_KEY );
    return stored === 'en' || stored === 'uk' ? stored : 'uk';
  }
}
