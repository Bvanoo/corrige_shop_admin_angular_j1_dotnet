import { CurrencyPipe, TitleCasePipe } from '@angular/common';
import { Component, computed, inject, input, numberAttribute } from '@angular/core';
import { RouterLink } from '@angular/router';
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

  product = computed(() => this.productService.getById(this.id()));
}