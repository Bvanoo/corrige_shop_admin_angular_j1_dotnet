import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Order } from '../../models/order';

@Component({
  imports: [CurrencyPipe, DatePipe],
  selector: 'app-order-table',
  styleUrl: './order-table.scss',
  templateUrl: './order-table.html',
})
// Composant DUMB : il reçoit UNE page de commandes déjà chargée + les infos de pagination.
// Il ne change pas la page lui-même : il émet pageChange et c'est le parent qui recharge
export class OrderTable {
  orders = input.required<Order[]>();
  page = input.required<number>();
  totalPages = input.required<number>();
  loading = input(false);

  pageChange = output<number>();
}
