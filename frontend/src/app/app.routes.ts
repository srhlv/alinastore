import { Routes } from '@angular/router';

import { adminAuthGuard } from './core/admin-auth.guard';

export const routes: Routes = [
  {
    path:          '',
    loadComponent: () =>
      import( './galleries/gallery-page.component' ).then(
        ( m ) => m.GalleryPageComponent,
      ),
  },
  {
    path:          'gallery',
    loadComponent: () =>
      import( './galleries/gallery-page.component' ).then(
        ( m ) => m.GalleryPageComponent,
      ),
  },
  {
    path:          'gallery/:id',
    loadComponent: () =>
      import( './galleries/detail/gallery-detail-page.component' ).then(
        ( m ) => m.GalleryDetailPageComponent,
      ),
  },
  {
    path:          'about',
    loadComponent: () =>
      import( './about/about-page.component' ).then( ( m ) => m.AboutPageComponent ),
  },
  {
    path:          'contact',
    loadComponent: () =>
      import( './contact/contact-page.component' ).then(
        ( m ) => m.ContactPageComponent,
      ),
  },
  {
    path:          'faq',
    loadComponent: () =>
      import( './faq/faq-page.component' ).then( ( m ) => m.FaqPageComponent ),
  },
  {
    path:          'cart',
    loadComponent: () =>
      import( './cart/cart-page.component' ).then( ( m ) => m.CartPageComponent ),
  },
  {
    path:          'checkout',
    loadComponent: () =>
      import( './checkout/checkout-page.component' ).then(
        ( m ) => m.CheckoutPageComponent,
      ),
  },
  {
    path:          'success',
    loadComponent: () =>
      import( './success/success-page.component' ).then(
        ( m ) => m.SuccessPageComponent,
      ),
  },
  {
    path:          'admin/login',
    loadComponent: () =>
      import( './admin/login/admin-login.component' ).then(
        ( m ) => m.AdminLoginComponent,
      ),
  },
  {
    path:        'admin',
    canActivate: [ adminAuthGuard ],
    children:    [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path:          'dashboard',
        loadComponent: () =>
          import( './admin/dashboard/admin-dashboard.component' ).then(
            ( m ) => m.AdminDashboardComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
