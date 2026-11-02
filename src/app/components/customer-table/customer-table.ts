import { Component, input, output } from '@angular/core';
import { Customer } from '../../models/customer';

@Component({
  selector: 'app-customer-table',
  styleUrl: './customer-table.scss',
  templateUrl: './customer-table.html',
})
// Composant DUMB : il ne connaît ni l'API ni les services.
// Il affiche ce qu'on lui donne (input) et prévient le parent quand on clique (output)
export class CustomerTable {
  customers = input.required<Customer[]>();
  selectedId = input<number | null>(null);

  selectCustomer = output<number>();
}
