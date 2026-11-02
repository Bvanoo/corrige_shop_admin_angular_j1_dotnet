import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
import { productExistsGuard } from './guards/product-exists-guard';
import { unsavedChangesGuard } from './guards/has-unsaved-change-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'catalogue', pathMatch: 'full' },
  {
    path: 'catalogue',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/catalogue-page/catalogue-page').then((m) => m.CataloguePage),
      },
      // IMPORTANT : 'new' doit être déclaré AVANT ':id', sinon "new" serait pris pour un id
      {
        path: 'new',
        canActivate: [adminGuard],
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import('./pages/product-form-page/product-form-page').then((m) => m.ProductFormPage),
      },
      {
        path: ':id',
        canActivate: [productExistsGuard],
        loadComponent: () =>
          import('./pages/product-detail-page/product-detail-page').then(
            (m) => m.ProductDetailPage
          ),
      },
      {
        path: ':id/edit',
        canActivate: [adminGuard, productExistsGuard],
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import('./pages/product-form-page/product-form-page').then((m) => m.ProductFormPage),
      },
    ],
  },
  {
    path: 'panier',
    loadComponent: () =>
      import('./pages/cart-page/cart-page').then((m) => m.CartPage),
  },
  {
    path: 'clients',
    loadComponent: () =>
      import('./pages/customers-page/customers-page').then((m) => m.CustomersPage),
  },
  // Toujours en dernier : toute URL inconnue tombe ici
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found-page/not-found-page').then((m) => m.NotFoundPage),
  },
];