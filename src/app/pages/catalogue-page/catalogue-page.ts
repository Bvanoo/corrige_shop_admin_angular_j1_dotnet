import { httpResource } from '@angular/common/http';
import { Component, computed, inject, linkedSignal, signal, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { combineLatest, debounceTime, distinctUntilChanged, map } from 'rxjs';
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

  // httpResource() : GET /products géré par Angular, exposé sous forme de signaux
  // value(), isLoading(), error(), reload()... La ressource est recréée à chaque visite de la page
  productsResource = httpResource<Product[]>(() => this.productService.url, { defaultValue: [] });

  // le stock est recalculé à partir du panier du service => il survit au changement de page
  // stock affiché = stock de base - quantité déjà dans le panier
  // les produits viennent maintenant de l'API (httpResource) et plus de la constante PRODUCTS
  products = computed<Product[]>(() => this.productsResource.value().map(product => {
    const quantiteDansPanier = this.panierService.cartItems()
      .find(ct => ct.product.id === product.id)?.quantity ?? 0;
    return {...product, stock: product.stock - quantiteDansPanier};
  }))
  // --- Recherche ---
  // texte saisi dans le champ de recherche (mis à jour à chaque frappe)
  searchText = signal('');

  // signal -> observable, puis on attend 300ms sans frappe et on ignore les valeurs identiques
  private searchTerm$ = toObservable(this.searchText).pipe(
    debounceTime(300),
    map(text => text.trim().toLowerCase()),
    distinctUntilChanged(),
  );

  // on combine le terme de recherche avec les produits (le stock change avec le panier)
  // puis on revient en signal avec toSignal() pour l'afficher dans la grille
  filteredProducts = toSignal(
    combineLatest([this.searchTerm$, toObservable(this.products)]).pipe(
      map(([term, products]) => products.filter(p => p.name.toLowerCase().includes(term))),
    ),
    { initialValue: this.products() },
  );

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