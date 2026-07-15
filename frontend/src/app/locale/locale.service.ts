import { computed, Injectable, signal } from '@angular/core';

import en from './en.json';
import uk from './uk.json';

export type AppLocale = 'uk' | 'en';

export type LocaleMessages = typeof uk;

type NestedValue = string | { [ key: string ]: NestedValue };

const STORAGE_KEY   = 'lang';
const DICTIONARIES: Record<AppLocale, LocaleMessages> = { uk, en };

@Injectable( { providedIn: 'root' } )
export class LocaleService {
  private readonly localeSignal = signal<AppLocale>( this.readStoredLocale() );

  readonly locale     = this.localeSignal.asReadonly();
  readonly isUkLocale = computed( () => this.localeSignal() === 'uk' );
  readonly isEnLocale = computed( () => this.localeSignal() === 'en' );
  readonly messages   = computed( () => DICTIONARIES[ this.localeSignal() ] );

  constructor() {
    this.applyDocumentLang( this.localeSignal() );
  }

  setLocale( locale: AppLocale ): void {
    this.localeSignal.set( locale );
    localStorage.setItem( STORAGE_KEY, locale );
    this.applyDocumentLang( locale );
  }

  /** UI string from `uk.json` / `en.json` by dotted path, e.g. `nav.cart`. */
  t( path: string, params?: Record<string, string | number> ): string {
    const value = this.resolvePath( this.messages(), path );
    if ( typeof value !== 'string' ) {
      return path;
    }

    if ( !params ) {
      return value;
    }

    return Object.entries( params ).reduce(
      ( text, [ key, param ] ) => text.replaceAll( `{{${ key }}}`, String( param ) ),
      value,
    );
  }

  /** Pick UA/EN value for the active locale (catalog `*Uk` / `*En` fields). */
  pickLocalized<T>( valueUk: T, valueEn: T ): T {
    return this.isUkLocale() ? valueUk : valueEn;
  }

  /**
   * Read `title` / `description` / `name` from an API entity with `*Uk`/`*En` fields.
   * Example: `localizedField( artwork, 'title' )` → `titleUk` or `titleEn`.
   */
  localizedField(
    entity: Record<string, unknown>,
    base:   string,
  ): string {
    const suffix = this.isUkLocale() ? 'Uk' : 'En';
    const value  = entity[ `${ base }${ suffix }` ];
    return typeof value === 'string' ? value : '';
  }

  formatPrice( price: number | string ): string {
    return new Intl.NumberFormat(
      this.isUkLocale() ? 'uk-UA' : 'en-US',
    ).format( Number( price ) );
  }

  private resolvePath( messages: NestedValue, path: string ): NestedValue | undefined {
    return path.split( '.' ).reduce<NestedValue | undefined>( ( current, key ) => {
      if ( current && typeof current === 'object' && key in current ) {
        return current[ key ];
      }
      return undefined;
    }, messages );
  }

  private readStoredLocale(): AppLocale {
    const stored = localStorage.getItem( STORAGE_KEY );
    return stored === 'en' || stored === 'uk' ? stored : 'uk';
  }

  private applyDocumentLang( locale: AppLocale ): void {
    if ( typeof document !== 'undefined' ) {
      document.documentElement.lang = locale;
    }
  }
}
