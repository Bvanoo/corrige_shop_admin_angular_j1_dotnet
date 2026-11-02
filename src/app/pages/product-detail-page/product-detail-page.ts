import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, inject, input, numberAttribute } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../models/product';
import { StockLabelPipe } from '../../pipes/stock-label-pipe';
import { AuthService } from '../../services/auth-service';
import { ProductService } from '../../services/product-service';

@Component({
  selector: 'app-product-detail-page',
  imports: [RouterLink, CurrencyPipe, TitleCasePipe, StockLabelPipe],
  templateUrl: './product-detail-page.html',
})
export class ProductDetailPage {
  // Grâce à withComponentInputBinding(), le :id de l'URL arrive ici.
  // Les paramètres d'URL sont des strings => numberAttribute les convertit en number
  id = input.required({ transform: numberAttribute });

  auth = inject(AuthService);
  private productService = inject(ProductService);
  private router = inject(Router);

  // la fonction lit le signal id() => si l'id change, la requête est relancée automatiquement
  product = httpResource<Product>(() => `${this.productService.url}/${this.id()}`);

  delete(product: Product) {
    if (!confirm(`Supprimer « ${product.name} » ?`)) return;

    // l'erreur éventuelle est déjà loggée par l'intercepteur
    this.productService.delete(product.id).subscribe(() => this.router.navigate(['/catalogue']));
  }
}
