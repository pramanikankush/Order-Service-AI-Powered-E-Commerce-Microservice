export type Money = number | string;

export interface Product {
  id: string;
  sku: string;
  title: string;
  description?: string;
  category?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
  hasEmbedding: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimilarProduct {
  id: string;
  sku: string;
  title: string;
  category?: string;
  price: number;
  imageUrl?: string;
  similarity: number; // 0..1
}

export interface CartItem {
  id: string;
  productId: string;
  sku: string;
  title: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  id?: string;
  ownerKey: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: "CREATED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  ownerKey: string;
  totalAmount: number;
  shippingAddress?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  sku: string;
  title: string;
  description?: string;
  category?: string;
  price: number;
  imageUrl?: string;
  stock?: number;
}
