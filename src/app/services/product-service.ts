import { Service, signal } from '@angular/core';
import { Product, PRODUCTS } from '../models/product';

@Service()
// Source de vérité des produits : PRODUCTS est en lecture seule, on en fait une copie modifiable
export class ProductService {
  private _products = signal<Product[]>([...PRODUCTS]);
  products = this._products.asReadonly();

  getById(id: number): Product | undefined {
    return this._products().find((p) => p.id === id);
  }

  add(data: Omit<Product, 'id'>): Product {
    const nextId = Math.max(0, ...this._products().map((p) => p.id)) + 1;
    const product: Product = { id: nextId, ...data };
    this._products.update((list) => [...list, product]);
    return product;
  }

  update(id: number, data: Omit<Product, 'id'>): void {
    this._products.update((list) => list.map((p) => (p.id === id ? { ...p, ...data } : p)));
  }
}