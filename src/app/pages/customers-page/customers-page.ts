import { httpResource } from '@angular/common/http';
import { Component, computed, signal } from '@angular/core';
import { API_URL } from '../../api';
import { CustomerOrders } from '../../components/customer-orders/customer-orders';
import { CustomerTable } from '../../components/customer-table/customer-table';
import { Customer } from '../../models/customer';

@Component({
  imports: [CustomerTable, CustomerOrders],
  selector: 'app-customers-page',
  styleUrl: './customers-page.scss',
  templateUrl: './customers-page.html',
})
// Page SMART : charge les clients et retient quel client est sélectionné.
//  - CustomerTable (dumb) affiche la liste et émet le client cliqué
//  - CustomerOrders (smart) charge les commandes paginées du client sélectionné
export class CustomersPage {
  customers = httpResource<Customer[]>(() => `${API_URL}/customers`, { defaultValue: [] });

  selectedId = signal<number | null>(null);

  selectedCustomer = computed(() =>
    this.customers.value().find((c) => c.id === this.selectedId())
  );

  // un 2e clic sur le même client referme ses commandes
  toggle(customerId: number) {
    this.selectedId.update((current) => (current === customerId ? null : customerId));
  }
}
