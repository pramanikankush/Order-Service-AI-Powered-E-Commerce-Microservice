import type { Cart, Order, Product, SimilarProduct } from "../types";

/**
 * In-memory fallback used when the Spring Boot backend is not running.
 * Behaves like the real API so the demo frontend is always usable.
 */

const LS_KEY = "orderservice.demo.v1";

interface Store {
  products: Product[];
  cart: Cart;
  orders: Order[];
}

function seedProducts(): Product[] {
  return [
    {
      id: "11111111-1111-1111-1111-111111111111",
      sku: "KEY-001",
      title: "Mechanical Keyboard 87-Key",
      description: "Compact hot-swappable mechanical keyboard with RGB and PBT keycaps.",
      category: "Keyboards",
      price: 149.0,
      stock: 50,
      hasEmbedding: true,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800",
    },
    {
      id: "22222222-2222-2222-2222-222222222222",
      sku: "MON-001",
      title: "UltraWide 34\" Curved Monitor",
      description: "34-inch UWQHD IPS panel with 144Hz refresh rate for productivity and gaming.",
      category: "Monitors",
      price: 599.0,
      stock: 20,
      hasEmbedding: true,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800",
    },
    {
      id: "33333333-3333-3333-3333-333333333333",
      sku: "MSE-001",
      title: "Ergonomic Wireless Mouse",
      description: "Vertical ergonomic mouse with Bluetooth and quiet clicks.",
      category: "Mice",
      price: 69.0,
      stock: 100,
      hasEmbedding: true,
      imageUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800",
    },
    {
      id: "44444444-4444-4444-4444-444444444444",
      sku: "HDN-001",
      title: "Studio Headphones",
      description: "Closed-back studio monitor headphones with flat response.",
      category: "Audio",
      price: 229.0,
      stock: 30,
      hasEmbedding: false,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    },
    {
      id: "55555555-5555-5555-5555-555555555555",
      sku: "LPT-001",
      title: "UltraBook 14\"",
      description: "Lightweight ultrabook with 32GB RAM and 1TB SSD.",
      category: "Laptops",
      price: 1499.0,
      stock: 10,
      hasEmbedding: true,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
    },
  ];
}

function load(): Store {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    products: seedProducts(),
    cart: { ownerKey: "demo", items: [], subtotal: 0, itemCount: 0 },
    orders: [],
  };
}

function save(s: Store) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {}
}

function uid() {
  return (crypto as any)?.randomUUID?.() || Math.random().toString(36).slice(2);
}

function recomputeCart(c: Cart): Cart {
  const subtotal = c.items.reduce((a, i) => a + i.lineTotal, 0);
  const itemCount = c.items.reduce((a, i) => a + i.quantity, 0);
  return { ...c, subtotal, itemCount };
}

export const demo = {
  listProducts: async (): Promise<Product[]> => load().products,
  getProduct: async (id: string): Promise<Product> => {
    const p = load().products.find(x => x.id === id);
    if (!p) throw new Error("Product not found");
    return p;
  },
  createProduct: async (req: any): Promise<Product> => {
    const s = load();
    const p: Product = {
      id: uid(),
      sku: req.sku,
      title: req.title,
      description: req.description,
      category: req.category,
      price: Number(req.price),
      imageUrl: req.imageUrl,
      stock: Number(req.stock || 0),
      hasEmbedding: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    s.products.push(p);
    save(s);
    return p;
  },
  updateProduct: async (id: string, req: any): Promise<Product> => {
    const s = load();
    const i = s.products.findIndex(p => p.id === id);
    if (i < 0) throw new Error("Not found");
    s.products[i] = { ...s.products[i], ...req, price: Number(req.price), stock: Number(req.stock ?? s.products[i].stock) };
    save(s);
    return s.products[i];
  },
  deleteProduct: async (id: string) => {
    const s = load();
    s.products = s.products.filter(p => p.id !== id);
    save(s);
  },
  similar: async (id: string): Promise<SimilarProduct[]> => {
    const s = load();
    const ref = s.products.find(p => p.id === id);
    if (!ref) return [];
    return s.products
      .filter(p => p.id !== id)
      .map(p => ({
        id: p.id,
        sku: p.sku,
        title: p.title,
        category: p.category,
        price: p.price,
        imageUrl: p.imageUrl,
        // Demo similarity: same category → higher score
        similarity: p.category === ref.category ? 0.85 + Math.random() * 0.1 : 0.45 + Math.random() * 0.2,
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  },
  getCart: async (_owner?: string): Promise<Cart> => {
    const s = load();
    return recomputeCart(s.cart);
  },
  addToCart: async (_owner: string, productId: string, quantity: number): Promise<Cart> => {
    const s = load();
    const prod = s.products.find(p => p.id === productId);
    if (!prod) throw new Error("Product not found");
    const existing = s.cart.items.find(i => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
      existing.lineTotal = existing.quantity * existing.unitPrice;
    } else {
      s.cart.items.push({
        id: uid(),
        productId,
        sku: prod.sku,
        title: prod.title,
        imageUrl: prod.imageUrl,
        unitPrice: prod.price,
        quantity,
        lineTotal: prod.price * quantity,
      });
    }
    s.cart = recomputeCart(s.cart);
    save(s);
    return s.cart;
  },
  updateCartItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const s = load();
    const item = s.cart.items.find(i => i.id === itemId);
    if (!item) throw new Error("Item not found");
    if (quantity <= 0) s.cart.items = s.cart.items.filter(i => i.id !== itemId);
    else {
      item.quantity = quantity;
      item.lineTotal = item.unitPrice * quantity;
    }
    s.cart = recomputeCart(s.cart);
    save(s);
    return s.cart;
  },
  removeCartItem: async (itemId: string): Promise<Cart> => {
    const s = load();
    s.cart.items = s.cart.items.filter(i => i.id !== itemId);
    s.cart = recomputeCart(s.cart);
    save(s);
    return s.cart;
  },
  placeOrder: async (shipping: string, notes?: string): Promise<Order> => {
    const s = load();
    if (!s.cart.items.length) throw new Error("Cart is empty");
    const now = new Date().toISOString();
    const o: Order = {
      id: uid(),
      orderNumber: "ORD-" + Math.random().toString(36).slice(2, 12).toUpperCase() + "-" + String(Math.floor(Math.random() * 10000)).padStart(4, "0"),
      status: "CREATED",
      ownerKey: "demo",
      totalAmount: s.cart.subtotal,
      shippingAddress: shipping,
      notes,
      items: s.cart.items.map(i => ({ id: uid(), productId: i.productId, sku: i.sku, title: i.title, quantity: i.quantity, unitPrice: i.unitPrice, lineTotal: i.lineTotal })),
      createdAt: now,
      updatedAt: now,
    };
    s.orders.unshift(o);
    s.cart = recomputeCart({ ownerKey: "demo", items: [], subtotal: 0, itemCount: 0 });
    save(s);
    return o;
  },
  listOrders: async (): Promise<Order[]> => load().orders,
  getOrder: async (id: string): Promise<Order> => {
    const o = load().orders.find(x => x.id === id);
    if (!o) throw new Error("Order not found");
    return o;
  },
};
