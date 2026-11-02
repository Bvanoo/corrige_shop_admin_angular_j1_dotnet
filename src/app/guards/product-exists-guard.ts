import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ProductService } from '../services/product-service';

// /catalogue/999 ou /catalogue/abc => redirection vers la page 404
export const productExistsGuard: CanActivateFn = (route) => {
  const productService = inject(ProductService);
  const router = inject(Router);
  const id = Number(route.paramMap.get('id'));

  return productService.getById(id) ? true : router.createUrlTree(['/404']);
};