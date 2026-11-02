import { effect, Service, signal } from '@angular/core';
import { cartItemModel } from '../components/cart-items/cart-item.model';

const STORAGE_KEY = 'shop-admin-panier';

@Service() // sa crée un singelton qui vivra tout le long de la vie de angular
//@Injectable({providedIn : 'root'})

//objectif
// - utilisable par n'importe quel composant
// - avoir une seul instance qui partage une liste de produit de cart item ou autre qui partage des données
// - avoir de la logique métier ou/et des appel API
// notre service garde un état cohérent de notre panier en + de partager l'état du panier à tout les composant
export class PanierService {
  // notre service gère sont état de sortre a ce qu'il reste cohérent
  // Restauration : le signal démarre avec ce qu'il y a dans le localStorage
  private _cartItems = signal<cartItemModel[]>(this.charger());
  cartItems = this._cartItems.asReadonly();

  constructor() {
    // Sauvegarde automatique à chaque changement du signal.
    // effect() doit être créé dans un contexte d'injection (ici le constructeur).
    effect(() => {
      const items = this._cartItems();

      if (items.length === 0) {
        // panier vide => on supprime la clé du storage
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    });
  }

  ajouter(cartItem: cartItemModel) {
    if (this.IsAlreadyInCart(cartItem)) {
      this._cartItems.update((list) =>
        list.map((ct) =>
          ct.product.id === cartItem.product.id
            ? { ...ct, quantity: ct.quantity + cartItem.quantity }
            : ct
        )
      );

      return;
    }
    this._cartItems.update((list) => [...list, cartItem]);
  }

  // Valide la commande : on vide le panier, l'effect supprime ensuite la clé du storage
  valider() {
    this._cartItems.set([]);
  }

  // Lecture du panier sauvegardé (panier vide si rien ou si le JSON est corrompu)
  private charger(): cartItemModel[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as cartItemModel[]) : [];
    } catch {
      return [];
    }
  }

  private IsAlreadyInCart(cartItem: cartItemModel) {
    let productsFind: cartItemModel[] = this._cartItems().filter(
      (ct) => ct.product.id === cartItem.product.id
    );

    if (productsFind.length > 1) {
      console.error("un doublon s'est glissé dans notre panier");
      return true; // return arrête la fonction immédiatement
    }

    return productsFind.length === 1 ? true : false;
  }
}