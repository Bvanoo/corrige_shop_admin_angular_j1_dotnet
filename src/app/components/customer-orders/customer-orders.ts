import { HttpHeaders, httpResource } from '@angular/common/http';
import { Component, input, linkedSignal } from '@angular/core';
import { API_URL } from '../../api';
import { Order } from '../../models/order';
import { OrderTable } from '../order-table/order-table';

@Component({
  imports: [OrderTable],
  selector: 'app-customer-orders',
  templateUrl: './customer-orders.html',
})
// Composant SMART : il reçoit seulement l'id du client et va chercher lui-même ses commandes (paginées)
export class CustomerOrders {
  customerId = input.required<number>();
  readonly pageSize = 5;

  // linkedSignal : on revient à la page 1 à chaque changement de client,
  // mais on peut toujours faire page.set(n) pour naviguer
  page = linkedSignal({ source: this.customerId, computation: () => 1 });

  // GET /customers/:id/orders?_page=2&_limit=5 (json-server)
  // la requête est relancée dès que customerId() ou page() change
  orders = httpResource<Order[]>(
    () => ({
      url: `${API_URL}/customers/${this.customerId()}/orders`,
      params: { _page: this.page(), _limit: this.pageSize, _sort: 'date', _order: 'desc' },
    }),
    { defaultValue: [] }
  );

  // json-server renvoie le nombre total de commandes dans le header X-Total-Count.
  // Pendant un chargement, headers() est vide : on garde alors la valeur précédente (le pager ne "saute" pas)
  totalPages = linkedSignal<HttpHeaders | undefined, number>({
    source: this.orders.headers,
    computation: (headers, previous) => {
      const total = headers?.get('X-Total-Count');
      if (total == null) return previous?.value ?? 1;
      return Math.max(1, Math.ceil(Number(total) / this.pageSize));
    },
  });
}
