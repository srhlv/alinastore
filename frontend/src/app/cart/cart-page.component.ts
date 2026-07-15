import { Component } from '@angular/core';

import { DefaultLayoutComponent } from '../shared/default-layout/default-layout.component';

@Component( {
  selector: 'app-cart-page',
  imports:  [ DefaultLayoutComponent ],
  template: `
    <app-default-layout>
      <h1 class="text-2xl font-semibold tracking-tight">Cart</h1>
      <p class="mt-2 text-neutral-600">Cart placeholder — step 16.</p>
    </app-default-layout>
  `,
} )
export class CartPageComponent {}
