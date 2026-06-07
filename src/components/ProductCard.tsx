import { useState } from "react";
import { motion } from "framer-motion";
import { Package, ShoppingBag } from "lucide-react";
import type { Product } from "../types";
import { cn } from "../utils/cn";

interface Props {
  product: Product;
  onClick?: () => void;
  onAddToCart?: () => void;
  onSimilar?: () => void;
  compact?: boolean;
}

export function ProductCard({ product, onClick, onAddToCart, onSimilar, compact }: Props) {
  const [imgFailed, setImgFailed] = useState(false);
  const stock = product.stock ?? 0;
  const lowStock = stock > 0 && stock <= 5;
  const out = stock === 0;
  const showImage = !!product.imageUrl && !imgFailed;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={onClick ? `Open ${product.title}` : undefined}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-zinc-200/70 bg-white transition-all outline-none focus-visible:ring-2 focus-visible:ring-indigo-200",
        "hover:shadow-[0_8px_30px_-12px_rgba(0,0,0,0.12)] hover:border-zinc-300"
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-50">
        {showImage ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid size-full place-items-center text-zinc-300" aria-hidden="true">
            <Package size={40} />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.category && (
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-600 backdrop-blur">
              {product.category}
            </span>
          )}
          {product.hasEmbedding && (
            <span className="rounded-full bg-indigo-500/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-white backdrop-blur">
              AI embedded
            </span>
          )}
        </div>

        <div className="absolute right-3 top-3">
          {out ? (
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-rose-600 ring-1 ring-rose-200">
              Sold out
            </span>
          ) : lowStock ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
              {stock} left
            </span>
          ) : (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
              In stock · {stock}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-zinc-900">{product.title}</h3>
            <p className="truncate text-xs text-zinc-500">SKU {product.sku}</p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-sm font-semibold text-zinc-900">${product.price.toFixed(2)}</div>
          </div>
        </div>

        {!compact && product.description && (
          <p className="line-clamp-2 text-xs leading-relaxed text-zinc-500">{product.description}</p>
        )}

        {!compact && (
          <div className="mt-auto flex items-center gap-2 pt-2">
            {onAddToCart && (
              <button
                disabled={out}
                onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
                aria-label={`Add ${product.title} to cart`}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition",
                  out ? "cursor-not-allowed bg-zinc-100 text-zinc-400" : "bg-zinc-900 text-white hover:bg-zinc-800"
                )}
              >
                <ShoppingBag size={12} /> Add to cart
              </button>
            )}
            {onSimilar && (
              <button
                onClick={(e) => { e.stopPropagation(); onSimilar(); }}
                aria-label={`Find products similar to ${product.title}`}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-50"
              >
                Similar
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
