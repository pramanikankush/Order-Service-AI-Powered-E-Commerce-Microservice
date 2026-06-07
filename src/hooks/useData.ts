import { useCallback } from "react";
import { api, extractError } from "../services/api";
import { demo } from "../services/demo";
import { useUi } from "../store";
import type { Cart, Order, Product, ProductRequest, SimilarProduct } from "../types";

/**
 * Unified data hook — tries real backend first, falls back to in-memory demo.
 * Keeps every page simple: just call the hook method and render.
 */
export function useData() {
  const { backendReady, ownerKey } = useUi();
  const live = backendReady === true;

  const listProducts = useCallback(async (): Promise<Product[]> => {
    if (live) return (await api.get("/products")).data;
    return demo.listProducts();
  }, [live]);

  const getProduct = useCallback(async (id: string): Promise<Product> => {
    if (live) return (await api.get(`/products/${id}`)).data;
    return demo.getProduct(id);
  }, [live]);

  const createProduct = useCallback(async (req: ProductRequest): Promise<Product> => {
    if (live) return (await api.post("/products", req)).data;
    return demo.createProduct(req);
  }, [live]);

  const updateProduct = useCallback(async (id: string, req: ProductRequest): Promise<Product> => {
    if (live) return (await api.put(`/products/${id}`, req)).data;
    return demo.updateProduct(id, req);
  }, [live]);

  const deleteProduct = useCallback(async (id: string) => {
    if (live) return api.delete(`/products/${id}`);
    return demo.deleteProduct(id);
  }, [live]);

  const similar = useCallback(async (id: string): Promise<SimilarProduct[]> => {
    if (live) return (await api.get(`/products/${id}/similar`, { params: { topK: 5 } })).data;
    return demo.similar(id);
  }, [live]);

  const getCart = useCallback(async (): Promise<Cart> => {
    if (live) return (await api.get("/cart", { headers: { "X-Owner-Key": ownerKey } })).data;
    return demo.getCart(ownerKey);
  }, [live, ownerKey]);

  const addToCart = useCallback(async (productId: string, qty: number): Promise<Cart> => {
    if (live) return (await api.post("/cart/items", { productId, quantity: qty }, { headers: { "X-Owner-Key": ownerKey } })).data;
    return demo.addToCart(ownerKey, productId, qty);
  }, [live, ownerKey]);

  const updateCart = useCallback(async (itemId: string, qty: number): Promise<Cart> => {
    if (live) return (await api.put(`/cart/items/${itemId}`, null, { params: { quantity: qty }, headers: { "X-Owner-Key": ownerKey } })).data;
    return demo.updateCartItem(itemId, qty);
  }, [live, ownerKey]);

  const removeFromCart = useCallback(async (itemId: string): Promise<Cart> => {
    if (live) return (await api.delete(`/cart/items/${itemId}`, { headers: { "X-Owner-Key": ownerKey } })).data;
    return demo.removeCartItem(itemId);
  }, [live, ownerKey]);

  const placeOrder = useCallback(async (shipping: string, notes?: string): Promise<Order> => {
    if (live) return (await api.post("/orders", { shippingAddress: shipping, notes }, { headers: { "X-Owner-Key": ownerKey } })).data;
    return demo.placeOrder(shipping, notes);
  }, [live, ownerKey]);

  const listOrders = useCallback(async (): Promise<Order[]> => {
    if (live) return (await api.get("/orders", { headers: { "X-Owner-Key": ownerKey } })).data;
    return demo.listOrders();
  }, [live, ownerKey]);

  const getOrder = useCallback(async (id: string): Promise<Order> => {
    if (live) return (await api.get(`/orders/${id}`)).data;
    return demo.getOrder(id);
  }, [live]);

  return {
    live,
    listProducts, getProduct, createProduct, updateProduct, deleteProduct, similar,
    getCart, addToCart, updateCart, removeFromCart,
    placeOrder, listOrders, getOrder,
    extractError,
  };
}
