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
    path:          'admin',
    canActivate:   [ adminAuthGuard ],
    loadComponent: () =>
      import( './admin/admin-shell.component' ).then( ( m ) => m.AdminShellComponent ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'artworks' },
      { path: 'dashboard', redirectTo: 'artworks' },
      {
        path:          'artworks',
        loadComponent: () =>
          import( './admin/catalog/admin-catalog-page.component' ).then(
            ( m ) => m.AdminCatalogPageComponent,
          ),
      },
      {
        path:          'artworks/new',
        loadComponent: () =>
          import( './admin/artworks/admin-artwork-form-page.component' ).then(
            ( m ) => m.AdminArtworkFormPageComponent,
          ),
      },
      {
        path:          'artworks/:id',
        loadComponent: () =>
          import( './admin/artworks/admin-artwork-form-page.component' ).then(
            ( m ) => m.AdminArtworkFormPageComponent,
          ),
      },
      {
        path:          'orders',
        loadComponent: () =>
          import( './admin/orders/admin-orders-page.component' ).then(
            ( m ) => m.AdminOrdersPageComponent,
          ),
      },
      {
        path:          'orders/:id',
        loadComponent: () =>
          import( './admin/orders/admin-order-detail-page.component' ).then(
            ( m ) => m.AdminOrderDetailPageComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
