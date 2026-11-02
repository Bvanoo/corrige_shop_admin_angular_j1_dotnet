// Les données viennent maintenant de l'API (db.json pour json-server)
export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}
