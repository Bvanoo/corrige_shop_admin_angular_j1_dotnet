export type OrderStatus = 'en attente' | 'expédiée' | 'livrée';

export interface Order {
  id: number;
  customerId: number;
  date: string; // format ISO : 2026-03-14
  total: number;
  status: OrderStatus;
}
