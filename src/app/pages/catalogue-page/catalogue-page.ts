import { Component, computed, inject, linkedSignal, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product';
import { ProductCard } from '../../components/product-card/product-card';
import { PanierService } from '../../services/panier.service';
import { ProductService } from '../../services/product-service';
import { AuthService } from '../../services/auth-service';
@Component({
  selector: 'app-catalogue-page',
  imports: [ProductCard, RouterLink],
  templateUrl: './catalogue-page.html',
  styleUrl: './catalogue-page.scss',
})

export class CataloguePage {

  panierService = inject(PanierService)
  productService = inject(ProductService)
  auth = inject(AuthService)

  // le stock est recalculé à partir du panier du service => il survit au changement de page
  // stock affiché = stock de base - quantité déjà dans le panier
  // les produits viennent maintenant du ProductService (modifiables) et plus de la constante PRODUCTS
  products = computed<Product[]>(() => this.productService.products().map(product => {
    const quantiteDansPanier = this.panierService.cartItems()
      .find(ct => ct.product.id === product.id)?.quantity ?? 0;
    return {...product, stock: product.stock - quantiteDansPanier};
  }))
  cartCount = signal(0);
  categories = signal<string[]>(["Informatique", "Audio"])


  addToCart(event : {product: Product; quantity: number}) {
    this.panierService.ajouter(event)

    this.cartCount.update((c) => c + event.quantity);
  }

  // LINKEDSIGNAL QUI PERMET de choisir notre categorie this.categoryChoice();
  // deux bouton pour les deux catégorie quand on clique sur un bouton le linked signal doit faire qlq chose
  // if dans le

  // Je crée une liste de produit avec seulement la catégorie Audio
  nbrAudio = computed(() => this.products().filter(product => product.category === 'Audio'))

  // Je crée jne liste de produit avec seulement la catégorie Inforatique
  nbrInformatique = computed(() => this.products().filter(product => product.category === 'Informatique'))

  // mon linked signal calcule quelle tableau de produit est le plus grand
  // SI AUDIO est plus grand que informatique notre selected va s'initialsier a 'Audio'
  // SI Audio est plus petit que informatique notre select va s'initialiser a 'Informatique'
  selected : WritableSignal<string> = linkedSignal(() => this.nbrAudio().length > this.nbrInformatique().length ? 'Audio' : 'Informatique');

  choisi(categoryChoice : string) : void {
    this.selected.set(categoryChoice);

}
}