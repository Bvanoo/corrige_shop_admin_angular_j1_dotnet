import { Component, computed, inject } from '@angular/core';
import { CartItems } from '../../components/cart-items/cart-items';
import { PanierService } from '../../services/panier.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [CartItems, CurrencyPipe],
  selector: 'app-cart-page',
  styleUrl: './cart-page.scss',
  templateUrl: './cart-page.html',
})
export class CartPage {
  panierService = inject(PanierService);
  // on utilise directement le signal du service => si le panier change, la page se met à jour toute seule
  cart = this.panierService.cartItems;
  // reduce() parcourir un tableau et accumulé le résultat grâce au total :
  // TABLEAU :
  // ITEM 1 : produit : (Souris, 10€), quantity : 5
  // ITEM 2 : produit : (Clavier, 15€), quantity : 2
  // valeur de départ donner dans le deuxieme argument est 0
  // IL PARCOURT LE TABLEAU IL EST ACUTELLEMENT DANS ITEM 1
  // total(0) + (10€ * 5) = 50
  // total(0) + resultatCalcul(50) = 50
  // IL continue a parcourir le tableau il est acutellement dans ITEM 2
  // total(50) + (15 * 2) = 30
  // total(50) + resultatCalcul(30) = 80
  // il va accumuler les résultats obtenu (50 et 30) ce qui va renvoyer un totalHTVA de 80
  totalHTVA = computed(() =>
    this.cart().reduce((total, item) => total + item.product.price * item.quantity, 0)
  );

  TVA = computed(() => this.totalHTVA() * 0.21);

  TotalTTC = computed(() => this.totalHTVA() + this.TVA());

  // Clic sur « Valider la commande » : vide le panier (et donc le localStorage)
  valider() {
    this.panierService.valider();
  }
}