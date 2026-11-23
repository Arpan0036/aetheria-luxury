"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Edit3, Minus, Plus, Search, Trash2 } from "lucide-react";
import {
  adjustProductStockInlineAction,
  deleteAdminProductAction,
  toggleProductFlagInlineAction,
} from "@/app/actions/admin";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ProductEditorDrawer } from "./ProductEditorDrawer";
import { useUIStore } from "@/store/useUIStore";
import { cn, formatPrice } from "@/lib/utils";
import type { CatalogProduct, Category, CategorySlug } from "@/types/database";

const CATEGORY_SHORT_LABELS: Record<CategorySlug, string> = {
  "spatial-audio": "Spatial Audio",
  "desk-architecture": "Desk Architecture",
  "tactile-computing": "Tactile Computing",
  "ambient-lighting": "Ambient Lighting",
};

export function AdminProductsTab({
  categories,
  products,
  onProductsChange,
}: {
  categories: Category[];
  products: CatalogProduct[];
  onProductsChange: (next: CatalogProduct[]) => void;
}) {
  const currency = useUIStore((s) => s.activeCurrency);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CatalogProduct | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.category_slug !== categoryFilter) return false;
      if (q) {
        const hay = `${p.title} ${p.sku} ${p.tagline}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [products, searchQuery, categoryFilter]);

  const handleAdjustStock = (product: CatalogProduct, delta: number) => {
    const nextStock = Math.max(0, product.stock_count + delta);
    onProductsChange(
      products.map((p) => (p.id === product.id ? { ...p, stock_count: nextStock } : p)),
    );

    startTransition(async () => {
      const res = await adjustProductStockInlineAction(product.id, nextStock);
      if (res.ok) {
        setToastMsg(
          `✓ ${product.sku} STOCK UPDATED → ${res.stockCount} UNITS IN LIVE SUPABASE`,
        );
      } else if (res.error) {
        setToastMsg(`STOCK UPDATE ERROR: ${res.error}`);
      }
    });
  };

  const handleToggleFlag = (
    product: CatalogProduct,
    field: "is_featured" | "is_bestseller",
  ) => {
    const nextVal = !product[field];
    onProductsChange(
      products.map((p) => (p.id === product.id ? { ...p, [field]: nextVal } : p)),
    );

    startTransition(async () => {
      const res = await toggleProductFlagInlineAction(product.id, field, nextVal);
      if (res.ok) {
        setToastMsg(
          `✓ ${product.sku} ${field.toUpperCase()} SET TO ${nextVal ? "TRUE" : "FALSE"} IN LIVE SUPABASE`,
        );
      }
    });
  };

  const handleDeleteProduct = (product: CatalogProduct) => {
    onProductsChange(products.filter((p) => p.id !== product.id));
    startTransition(async () => {
      const res = await deleteAdminProductAction(product.id);
      if (res.ok) {
        setToastMsg(`✓ ${product.sku} REMOVED FROM LIVE ARCHIVE`);
      } else if (res.error) {
        setToastMsg(`DELETE ERROR: ${res.error}`);
      }
    });
  };

  const handleProductSaved = (saved: CatalogProduct, message: string) => {
    const exists = products.some((p) => p.id === saved.id);
    const nextList = exists
      ? products.map((p) => (p.id === saved.id ? saved : p))
      : [saved, ...products];
    onProductsChange(nextList);
    setEditorOpen(false);
    setEditingProduct(null);
    setToastMsg(message);
  };

  return (
    <div className="space-y-6">
      {/* 3.1 Archive Toolbar */}
      <div className="flex flex-col justify-between gap-4 rounded-[24px] border border-line bg-surface p-5 lg:flex-row lg:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[230px] flex-1">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted"
              strokeWidth={1.75}
            />
            <label htmlFor="admin-product-search" className="sr-only">
              Search archive by title or SKU
            </label>
            <input
              id="admin-product-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Title or SKU (e.g., AE-SA-001)…"
              className="h-11 w-full rounded-xl border border-line-strong bg-canvas pl-10 pr-4 text-[13.5px] text-ink outline-none focus:border-ink"
            />
          </div>

          <label htmlFor="admin-category-filter" className="sr-only">
            Filter by architectural department
          </label>
          <select
            id="admin-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-11 rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[11px] tracking-wider text-ink outline-none focus:border-ink"
          >
            <option value="all">ALL DEPARTMENTS ({products.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <MagneticButton
          size="md"
          variant="primary"
          onClick={() => {
            setEditingProduct(null);
            setEditorOpen(true);
          }}
        >
          <Plus className="size-4" strokeWidth={2} />
          + Commission New Object
        </MagneticButton>
      </div>

      {/* Live Confirmation Toast */}
      {toastMsg && (
        <div
          role="status"
          data-testid="admin-products-toast"
          className="flex items-center justify-between gap-3 rounded-2xl border border-sage/45 bg-sage/10 px-5 py-3 font-mono text-[10.5px] tracking-[0.15em] text-sage"
        >
          <span className="inline-flex items-center gap-2">
            <Check className="size-3.5" strokeWidth={2.2} />
            {toastMsg}
          </span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="text-ink hover:text-accent"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* 3.2 Editorial Inventory Ledger */}
      <div className="rounded-[26px] border border-line bg-surface p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between font-mono text-[10px] tracking-[0.18em] text-muted">
          <span>
            SHOWING {filteredProducts.length} OF {products.length} LIVE SUPABASE OBJECTS
          </span>
          <span>INLINE STOCK &amp; CURATION CONTROLS</span>
        </div>

        <ul className="space-y-3" aria-label="Merchant inventory ledger">
          {filteredProducts.map((product) => {
            const img = product.images?.[0] ?? "/images/products/aether-01-headphones.png";
            const lowStock = product.stock_count <= 5;
            return (
              <li
                key={product.id}
                className="flex flex-col justify-between gap-4 rounded-[20px] border border-line bg-canvas p-4 transition-colors hover:border-line-strong xl:flex-row xl:items-center"
              >
                {/* Left: Thumbnail + SKU + Title + Department */}
                <div className="flex min-w-0 items-center gap-3.5">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-line bg-[#EFECE6]">
                    <Image
                      src={img}
                      alt={product.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-[9.5px] tracking-wider">
                      <span className="rounded bg-surface px-2 py-0.5 text-ink">
                        {product.sku}
                      </span>
                      <span className="text-muted">
                        {CATEGORY_SHORT_LABELS[product.category_slug]?.toUpperCase() ??
                          product.category_slug.toUpperCase()}
                      </span>
                      {lowStock && (
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 text-accent">
                          ● LOW STOCK
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="mt-1 block truncate font-display text-[23px] leading-tight text-ink hover:text-accent"
                    >
                      {product.title}
                    </Link>
                  </div>
                </div>

                {/* Right: Price + Inline Stock Stepper + Featured/Bestseller Toggles + Edit/Delete */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 xl:border-t-0 xl:pt-0">
                  <p className="tabular min-w-[88px] font-mono text-[15px] font-medium text-ink">
                    {formatPrice(product.price_usd, currency)}
                  </p>

                  {/* Inline Quick Stock Adjuster (- / count / +) */}
                  <div
                    aria-label={`Stock adjuster for ${product.title}`}
                    className="inline-flex h-9 items-center rounded-full border border-line-strong bg-surface px-1"
                  >
                    <button
                      type="button"
                      disabled={isPending || product.stock_count <= 0}
                      onClick={() => handleAdjustStock(product, -1)}
                      aria-label={`Decrease stock for ${product.title}`}
                      className="inline-flex size-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-canvas disabled:opacity-35"
                    >
                      <Minus className="size-3" strokeWidth={1.75} />
                    </button>
                    <span
                      data-testid={`stock-count-${product.sku}`}
                      className={cn(
                        "tabular min-w-12 text-center font-mono text-[11.5px] font-semibold",
                        lowStock ? "text-accent" : "text-ink",
                      )}
                    >
                      {product.stock_count}
                    </span>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleAdjustStock(product, 1)}
                      aria-label={`Increase stock for ${product.title}`}
                      className="inline-flex size-7 items-center justify-center rounded-full text-ink transition-colors hover:bg-canvas"
                    >
                      <Plus className="size-3" strokeWidth={1.75} />
                    </button>
                  </div>

                  {/* Inline Featured & Bestseller Switches */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={product.is_featured}
                      onClick={() => handleToggleFlag(product, "is_featured")}
                      className={cn(
                        "h-8 rounded-full border px-2.5 font-mono text-[9.5px] tracking-wider transition-colors",
                        product.is_featured
                          ? "border-ink bg-ink text-canvas"
                          : "border-line bg-surface text-muted hover:text-ink",
                      )}
                    >
                      FEAT
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={product.is_bestseller}
                      onClick={() => handleToggleFlag(product, "is_bestseller")}
                      className={cn(
                        "h-8 rounded-full border px-2.5 font-mono text-[9.5px] tracking-wider transition-colors",
                        product.is_bestseller
                          ? "border-sage bg-sage text-canvas"
                          : "border-line bg-surface text-muted hover:text-ink",
                      )}
                    >
                      BEST
                    </button>
                  </div>

                  {/* Edit & Delete Actions */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProduct(product);
                        setEditorOpen(true);
                      }}
                      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 font-mono text-[10px] font-medium tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
                    >
                      <Edit3 className="size-3" strokeWidth={1.75} />
                      [ Edit ]
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product)}
                      aria-label={`Delete ${product.title}`}
                      className="inline-flex size-9 items-center justify-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      <Trash2 className="size-3.5" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 3.3 Slide-Over "Commission / Edit Object" Drawer */}
      <ProductEditorDrawer
        open={editorOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => {
          setEditorOpen(false);
          setEditingProduct(null);
        }}
        onSaved={handleProductSaved}
      />
    </div>
  );
}
