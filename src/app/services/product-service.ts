import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '../api';
import { Product } from '../models/product';

@Service()
// Écritures sur l'API avec HttpClient (la LECTURE du catalogue se fait avec httpResource() dans les pages).
// HttpClient renvoie des Observables "froids" : rien n'est envoyé tant qu'on ne fait pas .subscribe()
export class ProductService {
  private http = inject(HttpClient);
  readonly url = `${API_URL}/products`;

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`);
  }

  create(data: Omit<Product, 'id'>): Observable<Product> {
    return this.http.post<Product>(this.url, data);
  }

  update(id: number, data: Omit<Product, 'id'>): Observable<Product> {
    return this.http.put<Product>(`${this.url}/${id}`, { id, ...data });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
