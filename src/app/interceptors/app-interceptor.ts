import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

// Intercepteur fonctionnel : TOUTES les requêtes HttpClient / httpResource passent par ici
//  - on ajoute le header X-App: shop-admin (une requête est immuable => clone)
//  - on logge les erreurs HTTP puis on les relance pour que l'appelant puisse les gérer
export const appInterceptor: HttpInterceptorFn = (req, next) => {
  const appReq = req.clone({ setHeaders: { 'X-App': 'shop-admin' } });

  return next(appReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(`[HTTP ${error.status}] ${req.method} ${req.urlWithParams}`, error.message);
      return throwError(() => error);
    })
  );
};
