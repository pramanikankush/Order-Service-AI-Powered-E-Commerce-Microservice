import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, SlidersHorizontal, Trash2, Edit3, Package } from "lucide-react";
import { toast } from "sonner";
import { useData } from "../hooks/useData";
import { extractError } from "../services/api";
import type { Product } from "../types";
import { ProductCard } from "../components/ProductCard";
import { ProductForm } from "../components/ProductForm";
import { Modal } from "../components/Modal";
import { SkeletonGrid } from "../components/Skeleton";

export function Products() {
  const { listProducts, createProduct, updateProduct, deleteProduct, addToCart } = useData();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");
  const [mode, setMode] = useState<"grid" | "table">("grid");
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const nav = useNavigate();

  const refresh = async () => {
    setLoading(true);
    try { setProducts(await listProducts()); }
    catch (e) { toast.error(extractError(e) || "Failed to load products"); }
    finally { setLoading(false); }
  };

  useEffect(() => { refresh(); }, []);

  const categories = useMemo(
    () => ["", ...Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[]],
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(p => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q)
      );
    });
  }, [products, query, category]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <PageHeader
        title="Products"
        subtitle="Create, edit, and recommend. Every product is embedded and discoverable."
        action={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
          >
            <Plus size={14} /> New product
          </button>
        }
      />

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, SKU, description…"
            className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-9 py-2 text-sm focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
            <SlidersHorizontal size={12} className="ml-2 text-zinc-400" />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg bg-transparent py-1.5 pr-2 text-xs text-zinc-600 focus:outline-none"
            >
              {categories.map(c => <option key={c} value={c}>{c || "All categories"}</option>)}
            </select>
          </div>
          <div className="flex rounded-xl border border-zinc-200 bg-white p-1 text-xs">
            {(["grid", "table"] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-lg px-3 py-1.5 font-medium capitalize transition ${mode === m ? "bg-zinc-900 text-white" : "text-zinc-500 hover:bg-zinc-100"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : filtered.length === 0 ? (
          <EmptyState onCreate={() => setCreating(true)} />
        ) : mode === "grid" ? (
          <motion.div layout className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map(p => (
                <div key={p.id} className="group relative">
                  <ProductCard
                    product={p}
                    onClick={() => nav(`/products/${p.id}/similar`)}
                    onAddToCart={async () => {
                      try {
                        await addToCart(p.id, 1);
                        toast.success(`Added ${p.title} to cart`);
                      } catch (e: any) { toast.error(e?.message || "Add failed"); }
                    }}
                    onSimilar={() => nav(`/products/${p.id}/similar`)}
                  />
                  <div className="absolute right-2 top-[calc(75%+8px)] flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <IconButton onClick={() => setEditing(p)} ariaLabel={`Edit ${p.title}`}><Edit3 size={12} /></IconButton>
                    <IconButton
                      danger
                      ariaLabel={`Delete ${p.title}`}
                      disabled={busyId === p.id}
                      onClick={async () => {
                        if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
                        setBusyId(p.id);
                        try { await deleteProduct(p.id); await refresh(); toast.success("Deleted"); }
                        catch (e) { toast.error(extractError(e) || "Delete failed"); }
                        finally { setBusyId(null); }
                      }}
                    >
                      <Trash2 size={12} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-[11px] uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium text-right">Price</th>
                  <th className="px-4 py-3 font-medium text-right">Stock</th>
                  <th className="px-4 py-3 font-medium">AI</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-t border-zinc-100 hover:bg-zinc-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 overflow-hidden rounded-lg bg-zinc-100">
                          {p.imageUrl ? <img src={p.imageUrl} className="size-full object-cover" alt={p.title} loading="lazy" /> : <div className="grid size-full place-items-center text-zinc-400"><Package size={14} /></div>}
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-zinc-900">{p.title}</div>
                          <div className="truncate text-[11px] text-zinc-500">{p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-600">{p.category || "—"}</td>
                    <td className="px-4 py-3 text-right font-medium">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right">
                      <StockBadge stock={p.stock ?? 0} />
                    </td>
                    <td className="px-4 py-3">
                      {p.hasEmbedding
                        ? <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-700 ring-1 ring-indigo-200">Embedded</span>
                        : <span className="rounded-full bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 ring-1 ring-zinc-200">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <IconButton onClick={() => setEditing(p)} ariaLabel={`Edit ${p.title}`}><Edit3 size={12} /></IconButton>
                        <IconButton onClick={() => nav(`/products/${p.id}/similar`)} ariaLabel={`View similar to ${p.title}`}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                        </IconButton>
                        <IconButton
                          danger
                          ariaLabel={`Delete ${p.title}`}
                          disabled={busyId === p.id}
                          onClick={async () => {
                            if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
                            setBusyId(p.id);
                            try { await deleteProduct(p.id); await refresh(); toast.success("Deleted"); }
                            catch (e) { toast.error(extractError(e) || "Delete failed"); }
                            finally { setBusyId(null); }
                          }}
                        ><Trash2 size={12} /></IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="New product">
        <ProductForm
          onCancel={() => setCreating(false)}
          onSubmit={async (r) => {
            try { await createProduct(r); await refresh(); setCreating(false); toast.success("Product created"); }
            catch (e) { toast.error(extractError(e)); }
          }}
          submitLabel="Create product"
        />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={`Edit ${editing?.title || ""}`}>
        {editing && (
          <ProductForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSubmit={async (r) => {
              try { await updateProduct(editing.id, r); await refresh(); setEditing(null); toast.success("Product updated"); }
              catch (e) { toast.error(extractError(e)); }
            }}
            submitLabel="Save changes"
          />
        )}
      </Modal>
    </main>
  );
}

function IconButton({ children, onClick, danger, disabled, ariaLabel }: { children: React.ReactNode; onClick: () => void; danger?: boolean; disabled?: boolean; ariaLabel?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`grid size-7 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 ${danger ? "hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600" : ""}`}
    >
      {children}
    </button>
  );
}

function StockBadge({ stock }: { stock: number }) {
  const cls = stock === 0 ? "bg-rose-50 text-rose-700 ring-rose-200" : stock <= 5 ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200";
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${cls}`}>{stock}</span>;
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 max-w-lg text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-zinc-300 bg-white p-14 text-center">
      <div className="grid size-12 place-items-center rounded-xl bg-zinc-100 text-zinc-400"><Package size={20} /></div>
      <h3 className="mt-4 text-sm font-semibold">No products yet</h3>
      <p className="mt-1 text-xs text-zinc-500">Create your first product to start building your catalog.</p>
      <button onClick={onCreate} className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800">
        <Plus size={14} /> Create product
      </button>
    </div>
  );
}
