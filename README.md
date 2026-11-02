# ShopAdmin

Mini back-office de boutique en ligne réalisé en **Angular 22** (composants standalone, signals, nouveau control flow `@if` / `@for`).
Projet fil rouge : chaque fonctionnalité illustre une notion du cours. Ce README indique **où** chaque notion est abordée dans le code.

Fonctionnalités :

- un **catalogue** de produits avec recherche, filtre par catégorie et ajout au panier ;
- une **fiche produit** et un **formulaire** de création / modification / suppression (réservés au mode admin) ;
- un **panier** sauvegardé dans le `localStorage`, avec le calcul de la TVA ;
- une page **clients**, avec les commandes paginées de chaque client ;
- toutes les données viennent d'une **API REST**, simulée avec json-server ou fournie par une API .NET.

---

## Sommaire

1. [Démarrage rapide](#démarrage-rapide)
2. [Scripts disponibles](#scripts-disponibles)
3. [L'API](#lapi)
4. [Architecture du projet](#architecture-du-projet)
5. [Qui fait quoi ?](#qui-fait-quoi-)
6. [Où trouver chaque notion ?](#où-trouver-chaque-notion-)
7. [Routes de l'application](#routes-de-lapplication)

---

## Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org/) en version LTS récente (22 ou plus) ;
- npm, qui est installé avec Node.

L'Angular CLI n'a pas besoin d'être installée globalement : `npx ng` et les scripts npm suffisent.

### Installation

```bash
git clone <url-du-repo>
cd corrige_shop_admin_angular_j1_dotnet-1
npm install
```

### Lancement

Il faut **deux terminaux** :

```bash
# Terminal 1 : l'API (json-server) sur http://localhost:3000
npm run api
```

```bash
# Terminal 2 : l'application Angular sur http://localhost:4200
npm start
```

Ouvrez ensuite <http://localhost:4200>.

> **Le catalogue affiche « Impossible de charger... » ?**
> L'API n'est pas lancée : démarrez `npm run api` puis cliquez sur « Réessayer ».

> **Mode admin** : le bouton « Mode admin » de la barre latérale débloque la création, la modification et la suppression de produits. C'est une fausse authentification, uniquement côté front.

---

## Scripts disponibles

| Commande        | Effet                                                         |
| --------------- | ------------------------------------------------------------- |
| `npm start`     | Lance le serveur de dev Angular (`ng serve`) avec le proxy `/api` |
| `npm run api`   | Lance json-server sur le port 3000 à partir de `db.json`      |
| `npm run build` | Build de production dans `dist/`                              |
| `npm run watch` | Build de dev en continu                                       |
| `npm test`      | Tests unitaires                                               |

---

## L'API

### Endpoints utilisés

| Méthode  | URL                                          | Utilisé par                         |
| -------- | -------------------------------------------- | ----------------------------------- |
| `GET`    | `/products`                                  | Catalogue (`httpResource`)          |
| `GET`    | `/products/:id`                              | Fiche produit, formulaire, guard    |
| `POST`   | `/products`                                  | Création d'un produit               |
| `PUT`    | `/products/:id`                              | Modification d'un produit           |
| `DELETE` | `/products/:id`                              | Suppression d'un produit            |
| `GET`    | `/customers`                                 | Page clients                        |
| `GET`    | `/customers/:id/orders?_page=1&_limit=5`     | Commandes paginées d'un client      |

Pour la pagination, json-server renvoie une page de commandes et donne le nombre **total** de commandes dans le header `X-Total-Count`. L'application s'en sert pour calculer le nombre de pages.

### Le proxy `/api`

L'application n'appelle jamais `http://localhost:3000` directement. Elle appelle `/api/...` (constante `API_URL` dans [`src/app/api.ts`](src/app/api.ts)) et le serveur de dev Angular redirige ces appels grâce à [`proxy.conf.json`](proxy.conf.json) :

```
navigateur ──> http://localhost:4200/api/products ──(proxy)──> http://localhost:3000/products
```

Le proxy a deux avantages :

- il n'y a **pas de problème de CORS**, car tout passe par la même origine ;
- pour **utiliser l'API .NET**, il suffit de changer la `target` dans `proxy.conf.json`. Le code Angular ne change pas.

### Données

Toutes les données sont dans [`db.json`](db.json) : 11 produits, 8 clients et 51 commandes.
Attention : json-server **écrit dans ce fichier** à chaque POST, PUT ou DELETE. Pour revenir aux données de départ, faites `git checkout db.json`.

> json-server est fixé en version **0.17.x**, car la v1 ne gère plus les routes imbriquées (`/customers/:id/orders`) ni la pagination `_page` / `_limit`.
> Le script lance aussi json-server avec `--static ./api-static`. Sans cette option, json-server servirait le dossier `public/` d'Angular, et le sous-dossier `public/products/` masquerait la route `/products`.

---

## Architecture du projet

```
├── db.json                     # base de données json-server
├── proxy.conf.json             # /api  ->  http://localhost:3000
└── src/app/
    ├── api.ts                  # URL de base de l'API
    ├── app.config.ts           # providers : router, HttpClient, intercepteur
    ├── app.routes.ts           # routes + guards + lazy loading
    ├── app.ts / app.html       # layout : header + sidebar + <router-outlet>
    │
    ├── pages/                  # composants routés ("smart")
    │   ├── catalogue-page/
    │   ├── product-detail-page/
    │   ├── product-form-page/
    │   ├── cart-page/
    │   ├── customers-page/
    │   └── not-found-page/
    │
    ├── components/             # composants réutilisables
    │   ├── header/  sidebar/
    │   ├── product-card/       # carte produit (dumb)
    │   ├── quantity-picker/    # boutons - / + (model)
    │   ├── cart-items/         # ligne du panier (dumb)
    │   ├── customer-table/     # tableau clients (dumb)
    │   ├── customer-orders/    # chargement des commandes paginées (smart)
    │   └── order-table/        # tableau de commandes + pager (dumb)
    │
    ├── services/
    │   ├── product-service.ts  # appels HTTP produits
    │   ├── panier.service.ts   # état du panier + localStorage
    │   └── auth-service.ts     # faux mode admin
    │
    ├── guards/                 # adminGuard, productExistsGuard, unsavedChangesGuard
    ├── interceptors/           # header X-App + log des erreurs HTTP
    ├── pipes/                  # stockLabel
    ├── Directives/             # appLowStock
    └── models/                 # interfaces Product, Customer, Order
```

---

## Qui fait quoi ?

### Pages

| Page                | Rôle                                                                                                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| `CataloguePage`     | Charge les produits avec `httpResource`, déduit le stock déjà mis au panier, gère la recherche (debounce) et le filtre par catégorie |
| `ProductDetailPage` | Affiche un produit (`httpResource` piloté par l'`id` de l'URL) et propose le bouton « Supprimer » en mode admin |
| `ProductFormPage`   | Un seul formulaire réactif pour deux routes : `/new` (POST) et `/:id/edit` (PUT)                           |
| `CartPage`          | Affiche le panier, calcule le total HTVA, la TVA (21 %) et le total TTC, et valide la commande             |
| `CustomersPage`     | Charge les clients et retient le client sélectionné                                                        |
| `NotFoundPage`      | Page 404                                                                                                   |

### Composants

| Composant         | Type  | Entrées / sorties                                                    |
| ----------------- | ----- | -------------------------------------------------------------------- |
| `ProductCard`     | dumb  | `input` product, `output` addToCart                                  |
| `QuantityPicker`  | dumb  | `model` quantity (double liaison `[(quantity)]`), `input` max        |
| `CartItems`       | dumb  | `input` ligne du panier                                              |
| `CustomerTable`   | dumb  | `input` customers et selectedId, `output` selectCustomer             |
| `CustomerOrders`  | smart | `input` customerId : charge **lui-même** les commandes paginées      |
| `OrderTable`      | dumb  | `input` orders, page, totalPages et loading, `output` pageChange     |
| `Header`, `Sidebar` | layout | La sidebar contient la navigation et le bouton du mode admin     |

> **Smart et dumb** : un composant *smart* sait **d'où viennent les données** (services, API). Un composant *dumb* se contente de **les afficher** : il reçoit tout en `input` et prévient son parent par des `output`.
> Sur la page clients : `CustomersPage` (smart) → `CustomerTable` (dumb) ; `CustomerOrders` (smart) → `OrderTable` (dumb).

### Services

| Service          | Rôle                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------- |
| `ProductService` | Écritures avec `HttpClient` : `getById`, `create`, `update`, `delete`                  |
| `PanierService`  | État du panier dans un signal privé, exposé en lecture seule, sauvegardé avec `effect()` dans le `localStorage` |
| `AuthService`    | Signal `isAdmin`, basculé depuis la sidebar                                            |

---

## Où trouver chaque notion ?

| Notion                                         | Où ?                                                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `input()` / `output()`                         | [`product-card.ts`](src/app/components/product-card/product-card.ts), [`customer-table.ts`](src/app/components/customer-table/customer-table.ts), [`order-table.ts`](src/app/components/order-table/order-table.ts) |
| `model()` et double liaison `[( )]`            | [`quantity-picker.ts`](src/app/components/quantity-picker/quantity-picker.ts)                            |
| `signal`, `computed`                           | [`catalogue-page.ts`](src/app/pages/catalogue-page/catalogue-page.ts), [`cart-page.ts`](src/app/pages/cart-page/cart-page.ts) |
| `linkedSignal`                                 | Catégorie par défaut dans [`catalogue-page.ts`](src/app/pages/catalogue-page/catalogue-page.ts) ; retour à la page 1 au changement de client dans [`customer-orders.ts`](src/app/components/customer-orders/customer-orders.ts) |
| `effect()`                                     | Sauvegarde dans le localStorage : [`panier.service.ts`](src/app/services/panier.service.ts) ; remplissage du formulaire : [`product-form-page.ts`](src/app/pages/product-form-page/product-form-page.ts) |
| Service singleton et état partagé              | [`panier.service.ts`](src/app/services/panier.service.ts), [`auth-service.ts`](src/app/services/auth-service.ts) |
| RxJS : `toObservable`, `debounceTime`, `combineLatest`, `toSignal` | Recherche dans [`catalogue-page.ts`](src/app/pages/catalogue-page/catalogue-page.ts)    |
| Control flow `@if`, `@for`, `@switch`, `@empty` | [`catalogue-page.html`](src/app/pages/catalogue-page/catalogue-page.html), [`product-card.html`](src/app/components/product-card/product-card.html) |
| Pipes natifs (`currency`, `titlecase`, `date`) | [`product-card.html`](src/app/components/product-card/product-card.html), [`order-table.html`](src/app/components/order-table/order-table.html) |
| Pipe personnalisé                              | [`stock-label-pipe.ts`](src/app/pipes/stock-label-pipe.ts)                                               |
| Directive d'attribut                           | [`low-stock.ts`](src/app/Directives/low-stock.ts) (fond rouge quand le stock vaut 3 ou moins)            |
| Routing, lazy loading, `routerLink`            | [`app.routes.ts`](src/app/app.routes.ts), [`sidebar.html`](src/app/components/sidebar/sidebar.html)      |
| Paramètre d'URL reçu en `input` (`withComponentInputBinding`) | [`product-detail-page.ts`](src/app/pages/product-detail-page/product-detail-page.ts)   |
| Guard `canActivate`                            | [`admin-guard.ts`](src/app/guards/admin-guard.ts), [`product-exists-guard.ts`](src/app/guards/product-exists-guard.ts) (asynchrone, appelle l'API) |
| Guard `canDeactivate`                          | [`has-unsaved-change-guard.ts`](src/app/guards/has-unsaved-change-guard.ts)                              |
| Formulaires réactifs et validation             | [`product-form-page.ts`](src/app/pages/product-form-page/product-form-page.ts)                           |
| `httpResource()` (lecture)                     | Catalogue, fiche produit, clients, commandes paginées (params et header `X-Total-Count`)                  |
| `HttpClient` (écriture)                        | [`product-service.ts`](src/app/services/product-service.ts) : POST, PUT, DELETE                          |
| Intercepteur HTTP                              | [`app-interceptor.ts`](src/app/interceptors/app-interceptor.ts) : header `X-App: shop-admin` et log des erreurs |
| Composants smart / dumb                        | Page clients (voir [Qui fait quoi ?](#qui-fait-quoi-))                                                   |

---

## Routes de l'application

| URL                     | Page                | Protection                                  |
| ----------------------- | ------------------- | ------------------------------------------- |
| `/`                     | redirige vers `/catalogue` |                                      |
| `/catalogue`            | `CataloguePage`     |                                             |
| `/catalogue/new`        | `ProductFormPage`   | `adminGuard`, `unsavedChangesGuard`         |
| `/catalogue/:id`        | `ProductDetailPage` | `productExistsGuard`                        |
| `/catalogue/:id/edit`   | `ProductFormPage`   | `adminGuard`, `productExistsGuard`, `unsavedChangesGuard` |
| `/panier`               | `CartPage`          |                                             |
| `/clients`              | `CustomersPage`     |                                             |
| `**`                    | `NotFoundPage`      |                                             |

> `new` est déclaré **avant** `:id` dans les routes. Sinon, Angular prendrait « new » pour un identifiant.
