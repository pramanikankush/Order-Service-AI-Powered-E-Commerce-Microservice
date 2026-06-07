import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Waves, Package } from "lucide-react";
import { toast } from "sonner";
import { useData } from "../hooks/useData";
import { extractError } from "../services/api";
import type { Product, SimilarProduct } from "../types";
import { PageHeader } from "./Products";
import { SkeletonGrid } from "../components/Skeleton";

export function Similar() {
  const { id } = useParams();
  const nav = useNavigate();
  const { getProduct, similar } = useData();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar_, setSimilar] = useState<SimilarProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [p, s] = await Promise.all([getProduct(id), similar(id)]);
        if (cancelled) return;
        setProduct(p);
        setSimilar(s);
      } catch (e) {
        if (!cancelled) toast.error(extractError(e) || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, getProduct, similar]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <button
        onClick={() => nav(-1)}
        className="mb-6 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900"
        aria-label="Go back"
      >
        <ArrowLeft size={12} /> Back
      </button>

      {loading ? (
        <>
          <SkeletonGrid count={1} className="h-64" />
          <div className="mt-8"><SkeletonGrid count={5} /></div>
        </>
      ) : product ? (
        <>
          <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-white">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center text-zinc-300" aria-hidden="true">
                  <Package size={48} />
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <div className="inline-flex items-center gap-1.5 self-start rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                <Sparkles size={10} /> Semantic recommendations
              </div>
              <PageHeader title={product.title} subtitle={product.description} />
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-medium">{product.category || "Uncategorized"}</span>
                <span className="font-mono">${product.price.toFixed(2)}</span>
                {product.hasEmbedding
                  ? <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 ring-1 ring-emerald-200"><Waves size={10} /> Embedded · 768-dim</span>
                  : <span className="rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700 ring-1 ring-amber-200">No embedding yet</span>}
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold tracking-tight">Similar products</h2>
            <p className="mt-1 text-sm text-zinc-500">Top {similar_.length} by cosine similarity using pgvector.</p>
          </div>

          {similar_.length === 0 ? (
            <div className="mt-6 grid place-items-center rounded-2xl border border-dashed border-zinc-300 bg-white p-14 text-center">
              <div className="grid size-12 place-items-center rounded-xl bg-zinc-100 text-zinc-400"><Sparkles size={20} /></div>
              <h3 className="mt-4 text-sm font-semibold">No similar products yet</h3>
              <p className="mt-1 text-xs text-zinc-500">
                Add more products with embeddings to see recommendations here.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {similar_.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => nav(`/products/${s.id}/similar`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); nav(`/products/${s.id}/similar`); } }}
                  aria-label={`Open similar product ${s.title}`}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-200 bg-white transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
                >
                  <div className="relative aspect-[4/3] bg-zinc-100">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} alt={s.title} loading="lazy" className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-zinc-300" aria-hidden="true">
                        <Package size={32} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <SimilarityBar value={s.similarity} />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="truncate text-sm font-semibold">{s.title}</div>
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span>{s.category || "—"}</span>
                      <span className="font-mono">${s.price.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-14 text-center">
          <h3 className="text-sm font-semibold">Product not found</h3>
          <p className="mt-1 text-xs text-zinc-500">It may have been deleted. Try browsing the catalog.</p>
          <button
            onClick={() => nav("/products")}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
          >
            Back to products
          </button>
        </div>
      )}
    </main>
  );
}

function SimilarityBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] font-medium text-white/90">
        <span className="inline-flex items-center gap-1"><Sparkles size={9} /> Similarity</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-fuchsia-400"
        />
      </div>
    </div>
  );
}
