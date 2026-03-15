export type Role = 'admin' | 'supplier' | 'buyer' | null;

export type ProductStatus = 'in-stock' | 'low-stock' | 'on-order' | 'pre-order' | 'pending' | 'active' | 'limited' | 'rejected';

export type OrderStatus = 'confirmed' | 'pending' | 'dispatched' | 'cancelled' | 'processing' | 'in-transit' | 'delivered';

export type QuoteStatus = 'pending-review' | 'quote-sent' | 'negotiating' | 'expired';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price_range?: string;
  status: ProductStatus;
}

export interface Order {
  id: string;
  products: string;
  qty: number;
  status: OrderStatus;
}

export interface Quote {
  id: string;
  products: string;
  qty: number;
  status: QuoteStatus;
}
