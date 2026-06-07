import type { ProductRequest } from "../types";
import { useState } from "react";

interface Props {
  initial?: Partial<ProductRequest>;
  onSubmit: (r: ProductRequest) => void | Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}

export function ProductForm({ initial, onSubmit, onCancel, submitLabel = "Save product" }: Props) {
  const [form, setForm] = useState<ProductRequest>({
    sku: initial?.sku || "",
    title: initial?.title || "",
    description: initial?.description || "",
    category: initial?.category || "",
    price: initial?.price ?? 0,
    imageUrl: initial?.imageUrl || "",
    stock: initial?.stock ?? 0,
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={async (e) => { e.preventDefault(); await onSubmit(form); }}
    >
      <div className="grid grid-cols-2 gap-3">
        <Field label="SKU">
          <input
            required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
            placeholder="SKU-001" className="field"
          />
        </Field>
        <Field label="Category">
          <input value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Electronics" className="field" />
        </Field>
      </div>

      <Field label="Title">
        <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Premium product name" className="field" />
      </Field>

      <Field label="Description">
        <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3} placeholder="Describe the product…" className="field resize-none" />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Price (USD)">
          <input type="number" step="0.01" min="0" required value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="field" />
        </Field>
        <Field label="Stock">
          <input type="number" min="0" required value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="field" />
        </Field>
        <Field label="Image URL">
          <input value={form.imageUrl || ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            placeholder="https://…" className="field" />
        </Field>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50">
          Cancel
        </button>
        <button type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800">
          {submitLabel}
        </button>
      </div>

      <style>{`.field {
        width: 100%;
        border-radius: 10px;
        border: 1px solid #e4e4e7;
        background: #fafaf9;
        padding: 8px 10px;
        font-size: 13px;
        color: #18181b;
        transition: border-color .15s, background .15s;
      }
      .field:focus { outline: none; border-color: #6366f1; background: #fff; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }`}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">{label}</span>
      {children}
    </label>
  );
}
