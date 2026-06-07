import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, FileText, CheckCircle2, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import { useData } from "../hooks/useData";
import { extractError } from "../services/api";
import type { Order } from "../types";
import { PageHeader } from "./Products";
import { SkeletonList } from "../components/Skeleton";
import { cn } from "../utils/cn";

const STATUSES: Order["status"][] = ["CREATED", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export function Orders() {
  const { listOrders } = useData();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await listOrders();
        if (!cancelled) setOrders(data);
      } catch (e) {
        if (!cancelled) {
          setOrders([]);
          toast.error(extractError(e));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [listOrders]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader title="Orders" subtitle="Every order is an outbox event that flowed to Kafka atomically." />

      {loading ? (
        <SkeletonList count={4} className="mt-6" />
      ) : orders.length === 0 ? (
        <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-zinc-300 bg-white p-14 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-zinc-100 text-zinc-400"><FileText size={20} /></div>
          <h3 className="mt-4 text-sm font-semibold">No orders yet</h3>
          <p className="mt-1 text-xs text-zinc-500">Place an order from the cart to see it here.</p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map(o => <OrderCard key={o.id} order={o} />)}
        </div>
      )}
    </main>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  const activeIdx = STATUSES.indexOf(order.status);

  return (
    <motion.div layout className="rounded-2xl border border-zinc-200 bg-white">
      <button onClick={() => setOpen(v => !v)} className="flex w-full items-center gap-4 p-5 text-left">
        <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 text-white">
          <Package size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
            <StatusPill status={order.status} />
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Placed {new Date(order.createdAt).toLocaleString()} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold">${order.totalAmount.toFixed(2)}</div>
          <div className="text-[11px] text-zinc-500">Total</div>
        </div>
      </button>

      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden border-t border-zinc-100"
        >
          <div className="grid gap-6 p-5 md:grid-cols-[1fr_260px]">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Items</h4>
              <ul className="mt-3 divide-y divide-zinc-100 rounded-xl border border-zinc-100">
                {order.items.map(i => (
                  <li key={i.id} className="flex items-center gap-3 p-3 text-sm">
                    <div className="grid size-8 place-items-center rounded-lg bg-zinc-100 text-zinc-400"><Package size={12} /></div>
                    <div className="flex-1">
                      <div className="font-medium">{i.title}</div>
                      <div className="text-[11px] text-zinc-500">{i.sku} · qty {i.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold">${i.lineTotal.toFixed(2)}</div>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Timeline</h4>
              <ol className="mt-3 space-y-3">
                {STATUSES.filter(s => s !== "CANCELLED").map((s, i) => (
                  <li key={s} className="flex items-start gap-3">
                    <div className={cn(
                      "mt-0.5 grid size-5 place-items-center rounded-full ring-2",
                      i < activeIdx ? "bg-emerald-500 text-white ring-emerald-200"
                      : i === activeIdx ? "bg-zinc-900 text-white ring-zinc-300"
                      : "bg-white text-zinc-300 ring-zinc-200"
                    )}>
                      {i < activeIdx ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-medium">{s}</div>
                    </div>
                  </li>
                ))}
              </ol>
              {order.shippingAddress && (
                <div className="mt-5 flex items-start gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3 text-xs text-zinc-600">
                  <MapPin size={12} className="mt-0.5 text-zinc-400" />
                  <span>{order.shippingAddress}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function StatusPill({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], string> = {
    CREATED: "bg-zinc-100 text-zinc-700 ring-zinc-200",
    CONFIRMED: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    SHIPPED: "bg-sky-50 text-sky-700 ring-sky-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ${map[status]}`}>{status}</span>;
}
