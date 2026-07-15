import { Component, HostListener, input, output } from '@angular/core';

@Component( {
  selector: 'app-lightbox',
  template: `
    @if ( open() ) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        role="dialog"
        aria-modal="true"
        (click)="close.emit()"
      >
        <button
          type="button"
          class="absolute top-4 right-4 z-10 text-3xl leading-none text-white hover:opacity-70"
          aria-label="Close"
          (click)="close.emit(); $event.stopPropagation()"
        >
          ×
        </button>

        @if ( photos().length > 1 ) {
          <button
            type="button"
            class="absolute left-4 z-10 px-3 text-3xl text-white hover:opacity-70"
            aria-label="Previous"
            (click)="goPrev(); $event.stopPropagation()"
          >
            ‹
          </button>
          <button
            type="button"
            class="absolute right-4 z-10 px-3 text-3xl text-white hover:opacity-70"
            aria-label="Next"
            (click)="goNext(); $event.stopPropagation()"
          >
            ›
          </button>
        }

        <img
          [src]="photos()[ index() ]"
          alt=""
          class="max-h-[90vh] max-w-[90vw] object-contain"
          (click)="$event.stopPropagation()"
        />
      </div>
    }
  `,
} )
export class LightboxComponent {
  readonly photos      = input.required<string[]>();
  readonly open        = input( false );
  readonly index       = input( 0 );
  readonly close       = output<void>();
  readonly indexChange = output<number>();

  @HostListener( 'document:keydown', [ '$event' ] )
  onKeydown( event: KeyboardEvent ): void {
    if ( !this.open() ) {
      return;
    }

    if ( event.key === 'Escape' ) {
      this.close.emit();
    } else if ( event.key === 'ArrowLeft' ) {
      this.goPrev();
    } else if ( event.key === 'ArrowRight' ) {
      this.goNext();
    }
  }

  goPrev(): void {
    const count = this.photos().length;
    if ( count === 0 ) {
      return;
    }
    this.indexChange.emit( ( this.index() - 1 + count ) % count );
  }

  goNext(): void {
    const count = this.photos().length;
    if ( count === 0 ) {
      return;
    }
    this.indexChange.emit( ( this.index() + 1 ) % count );
  }
}
