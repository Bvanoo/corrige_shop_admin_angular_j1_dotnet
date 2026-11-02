import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { ProductService } from '../services/product-service';

// /catalogue/999 ou /catalogue/abc => redirection vers la page 404
// Le guard peut renvoyer un Observable : le routeur attend la réponse de l'API avant de décider
export const productExistsGuard: CanActivateFn = (route) => {
  const productService = inject(ProductService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  if (Number.isNaN(id)) return router.createUrlTree(['/404']);

  return productService.getById(id).pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/404'])))
  );
};
