import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useData } from "../hooks/useData";
import type { Cart, CartItem } from "../types";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "./Products";
import { SkeletonList } from "../components/Skeleton";
import { extractError } from "../services/api";

const EMPTY_CART: Cart = { ownerKey: "", items: [], subtotal: 0, itemCount: 0 };

export function CartPage() {
  const { getCart, updateCart, removeFromCart, placeOrder } = useData();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [shipping, setShipping] = useState("");
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const nav = useNavigate();

  const refresh = async () => {
    setLoading(true);
    try { setCart(await getCart()); }
    catch (e) { setCart(EMPTY_CART); toast.error(extractError(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const onQty = async (item: CartItem, delta: number) => {
    const q = item.quantity + delta;
    try { setCart(await updateCart(item.id, q)); }
    catch (e) { toast.error(extractError(e)); }
  };
  const onRemove = async (id: string) => {
    try { setCart(await removeFromCart(id)); toast.success("Removed"); }
    catch (e) { toast.error(extractError(e)); }
  };
  const onPlace = async () => {
    if (!shipping.trim()) return toast.error("Enter a shipping address");
    setPlacing(true);
    try {
      const o = await placeOrder(shipping, notes);
      toast.success(`Order placed: ${o.orderNumber}`);
      setShipping("");
      setNotes("");
      nav("/orders");
    } catch (e) {
      toast.error(extractError(e));
    } finally { setPlacing(false); }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-10">
        <PageHeader title="Cart" />
        <SkeletonList count={3} />
      </main>
    );
  }

  const safeCart: Cart = cart ?? EMPTY_CART;
  const items = safeCart.items;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Cart"
        subtitle={items.length ? `${itemCount} item${itemCount === 1 ? "" : "s"} ready for checkout.` : "Your cart is empty."}
      />

      {items.length === 0 ? (
        <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-zinc-300 bg-white p-14 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-zinc-100 text-zinc-400"><ShoppingBag size={20} /></div>
          <h3 className="mt-4 text-sm font-semibold">Nothing here yet</h3>
          <p className="mt-1 text-xs text-zinc-500">Add a product from the catalog to see it here.</p>
          <button
            onClick={() => nav("/products")}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
          >
            Browse products <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                    {item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" className="size-full object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm font-semibold">{item.title}</div>
                    <div className="text-xs text-zinc-500">{item.sku} · ${item.unitPrice.toFixed(2)} each</div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1">
                    <button
                      onClick={() => onQty(item, -1)}
                      aria-label={`Decrease quantity of ${item.title}`}
                      className="grid size-7 place-items-center rounded-full hover:bg-zinc-100"
                    >
                      <Minus size={12} />
                    </button>
                    <span aria-live="polite" className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => onQty(item, 1)}
                      aria-label={`Increase quantity of ${item.title}`}
                      className="grid size-7 place-items-center rounded-full hover:bg-zinc-100"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <div className="w-20 text-right text-sm font-semibold">${item.lineTotal.toFixed(2)}</div>
                  <button
                    onClick={() => onRemove(item.id)}
                    aria-label={`Remove ${item.title} from cart`}
                    className="grid size-8 place-items-center rounded-full text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6">
            <h3 className="text-sm font-semibold">Checkout</h3>

            <div className="mt-4 space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Shipping address</span>
                <textarea
                  rows={3}
                  value={shipping}
                  onChange={(e) => setShipping(e.target.value)}
                  placeholder="123 Market St, San Francisco, CA"
                  aria-required="true"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">Notes (optional)</span>
                <input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Leave at the door"
                  className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </label>
            </div>

            <dl className="mt-6 space-y-2 border-t border-zinc-100 pt-4 text-sm">
              <Row label="Subtotal" value={`$${subtotal.toFixed(2)}`} />
              <Row label="Shipping" value="Free" muted />
              <Row label="Tax" value="$0.00" muted />
              <div className="h-px bg-zinc-100" />
              <Row
                label={<span className="font-semibold">Total</span>}
                value={<span className="font-semibold">${subtotal.toFixed(2)}</span>}
              />
            </dl>

            <button
              disabled={placing}
              onClick={onPlace}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {placing ? "Placing…" : "Place order"} <ArrowRight size={14} />
            </button>
            <p className="mt-3 text-center text-[11px] text-zinc-400">
              Atomic inventory decrement + outbox event → Kafka `order-created`
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}

function Row({ label, value, muted }: { label: React.ReactNode; value: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-zinc-500" : ""}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
