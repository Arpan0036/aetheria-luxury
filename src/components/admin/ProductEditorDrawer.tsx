"use client";

import { useEffect, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CloudUpload, Sparkles, Upload, X } from "lucide-react";
import { upsertAdminProductAction } from "@/app/actions/admin";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { cn } from "@/lib/utils";
import type { CatalogProduct, Category } from "@/types/database";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ProductEditorBody({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product: CatalogProduct | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (saved: CatalogProduct, message: string) => void;
}) {
  const defaultCategoryId = product?.category_id ?? categories[0]?.id ?? "";

  const [title, setTitle] = useState(product?.title ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [sku, setSku] = useState(product?.sku ?? "AE-SA-014");
  const [categoryId, setCategoryId] = useState(defaultCategoryId);
  const [priceUsd, setPriceUsd] = useState(String(product?.price_usd ?? 480));
  const [compareAtPriceUsd, setCompareAtPriceUsd] = useState(
    product?.compare_at_price_usd ? String(product.compare_at_price_usd) : "",
  );
  const [stockCount, setStockCount] = useState(String(product?.stock_count ?? 24));
  const [tagline, setTagline] = useState(
    product?.tagline ?? "Precision-milled from solid billet aluminum and Roman travertine.",
  );
  const [description, setDescription] = useState(
    product?.description ??
      "Hand-assembled in our Warm Travertine Studio and tuned for decades of tactile permanence.",
  );
  const [materialsInput, setMaterialsInput] = useState(
    product?.materials?.join(", ") ?? "Anodized aluminum, Roman travertine, Solid brass",
  );
  const [dimensions, setDimensions] = useState(product?.dimensions ?? "240 × 180 × 85 mm");
  const [weight, setWeight] = useState(product?.weight ?? "2.1 kg");
  const [imageUrl, setImageUrl] = useState(
    product?.images?.[0] ?? "/images/products/aether-01-headphones.png",
  );
  const [isFeatured, setIsFeatured] = useState(Boolean(product?.is_featured ?? true));
  const [isBestseller, setIsBestseller] = useState(Boolean(product?.is_bestseller ?? false));
  const [isNewArrival, setIsNewArrival] = useState(Boolean(product?.is_new_arrival ?? true));

  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const uploadBlobToSupabaseStorage = async (blob: Blob, filename: string) => {
    setIsUploading(true);
    setUploadStatus(null);
    setErrorMsg(null);

    try {
      const supabase = createBrowserSupabaseClient();
      if (!supabase) {
        setImageUrl("/images/products/aether-01-headphones.png");
        setUploadStatus(
          "✓ SANDBOX PREVIEW PLATE ATTACHED (ADD SUPABASE KEYS FOR CLOUD STORAGE)",
        );
        setIsUploading(false);
        return;
      }

      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
      const storagePath = `studio/${Date.now()}-${safeName}`;

      const { error: uploadErr } = await supabase.storage
        .from("product-images")
        .upload(storagePath, blob, {
          cacheControl: "3600",
          upsert: true,
          contentType: blob.type || "image/png",
        });

      if (uploadErr) {
        setErrorMsg(`Storage upload error: ${uploadErr.message}`);
        setIsUploading(false);
        return;
      }

      const { data: pubData } = supabase.storage
        .from("product-images")
        .getPublicUrl(storagePath);

      if (pubData?.publicUrl) {
        setImageUrl(pubData.publicUrl);
        setUploadStatus(`✓ UPLOADED TO SUPABASE STORAGE (product-images/${storagePath})`);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadBlobToSupabaseStorage(file, file.name);
  };

  // 1-Click Upload Sample Studio Plate to Supabase Storage ('product-images' bucket)
  const handleUploadSampleStudioPlate = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Warm Travertine Studio gradient background
    const grad = ctx.createLinearGradient(0, 0, 640, 800);
    grad.addColorStop(0, "#F7F4EF");
    grad.addColorStop(0.55, "#EFECE6");
    grad.addColorStop(1, "#DED8CC");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 800);

    // Architectural travertine pedestal block
    ctx.fillStyle = "#D6CEC0";
    ctx.fillRect(120, 520, 400, 220);

    // Metallic Anodized Sculpture Silhouette + Terracotta Core
    ctx.fillStyle = "#2A2826";
    ctx.beginPath();
    ctx.arc(320, 340, 145, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#C85632";
    ctx.beginPath();
    ctx.arc(320, 340, 74, 0, Math.PI * 2);
    ctx.fill();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png"),
    );
    if (!blob) return;

    await uploadBlobToSupabaseStorage(blob, `${slug || "aetheria-object"}-studio.png`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    const materials = materialsInput
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await upsertAdminProductAction({
        id: product?.id,
        category_id: categoryId,
        sku,
        title,
        slug: slug || slugify(title),
        tagline,
        description,
        price_usd: Number(priceUsd) || 350,
        compare_at_price_usd: compareAtPriceUsd ? Number(compareAtPriceUsd) : null,
        stock_count: Number(stockCount) || 0,
        is_featured: isFeatured,
        is_bestseller: isBestseller,
        is_new_arrival: isNewArrival,
        materials,
        dimensions,
        weight,
        images: [imageUrl.trim() || "/images/products/aether-01-headphones.png"],
      });

      if (!res.ok || !res.product) {
        setErrorMsg(res.error ?? "Failed to save object to Supabase.");
        return;
      }

      onSaved(res.product, "✓ OBJECT SYNCED TO LIVE STOREFRONT");
    });
  };

  return (
    <motion.aside
      role="dialog"
      aria-modal="true"
      aria-label={product ? `Edit ${product.title}` : "Commission New Object"}
      data-lenis-prevent
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}
      onClick={(e) => e.stopPropagation()}
      className="relative z-10 flex h-dvh w-full max-w-[600px] flex-col border-l border-line-strong bg-canvas shadow-[-40px_0_100px_-30px_rgb(var(--shadow-tint)/0.65)]"
    >
      {/* Header */}
      <header className="flex items-center justify-between border-b border-line px-6 py-5">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-accent">
            {product ? `EDIT ARCHIVE RECORD // ${product.sku}` : "NEW ARCHIVE COMMISSION // PUBLIC.PRODUCTS"}
          </p>
          <h2 className="mt-1 font-display text-[30px] leading-none text-ink">
            {product ? product.title : "Commission New Object"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product editor drawer"
          className="inline-flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 font-mono text-[10px] tracking-wider text-ink transition-colors hover:border-ink hover:bg-ink hover:text-canvas"
        >
          <span>ESC</span>
          <X className="size-3.5" strokeWidth={1.75} />
        </button>
      </header>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          {/* Live Supabase Storage Image Uploader ('product-images' bucket) */}
          <div className="rounded-[22px] border border-line bg-surface p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] tracking-[0.16em]">
              <span className="inline-flex items-center gap-1.5 text-ink">
                <CloudUpload className="size-3.5 text-accent" strokeWidth={1.75} />
                SUPABASE STORAGE // BUCKET: PRODUCT-IMAGES
              </span>
              <button
                type="button"
                disabled={isUploading}
                onClick={handleUploadSampleStudioPlate}
                data-testid="upload-sample-storage-btn"
                className="inline-flex items-center gap-1 rounded-full border border-accent bg-accent/10 px-3 py-1 font-mono text-[9.5px] font-medium text-accent transition-colors hover:bg-accent hover:text-accent-on disabled:opacity-50"
              >
                <Sparkles className="size-3" strokeWidth={1.75} />
                {isUploading ? "UPLOADING…" : "⚡ 1-Click Test Storage Upload"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-[112px_1fr]">
              <div className="relative aspect-[4/5] w-28 overflow-hidden rounded-2xl border border-line bg-[#EFECE6]">
                <Image
                  src={imageUrl || "/images/products/aether-01-headphones.png"}
                  alt={title || "Studio preview"}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              <div className="flex flex-col justify-between space-y-3">
                <label
                  htmlFor="product-storage-file"
                  className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line-strong bg-canvas p-3.5 text-center transition-colors hover:border-ink"
                >
                  <Upload className="size-4 text-accent" strokeWidth={1.75} />
                  <span className="mt-1 font-mono text-[10px] tracking-wider text-ink">
                    {isUploading
                      ? "UPLOADING TO SUPABASE STORAGE…"
                      : "CLICK OR DROP IMAGE (PNG / JPG / WEBP)"}
                  </span>
                  <input
                    id="product-storage-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>

                <div>
                  <label
                    htmlFor="product-image-url"
                    className="mb-1 block font-mono text-[9.5px] tracking-[0.16em] text-muted"
                  >
                    ACTIVE IMAGE URL (SUPABASE STORAGE OR /IMAGES/PRODUCTS/…)
                  </label>
                  <input
                    id="product-image-url"
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="h-9 w-full rounded-xl border border-line-strong bg-canvas px-3 font-mono text-[11px] text-ink outline-none focus:border-ink"
                  />
                </div>
              </div>
            </div>

            {uploadStatus && (
              <p
                role="status"
                data-testid="storage-upload-toast"
                className="mt-3 rounded-xl border border-sage/45 bg-sage/10 px-3 py-2 font-mono text-[9.5px] tracking-wider text-sage"
              >
                {uploadStatus}
              </p>
            )}
          </div>

          {/* Title, Slug, SKU, Category */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="editor-title"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                OBJECT TITLE *
              </label>
              <input
                id="editor-title"
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!product) setSlug(slugify(e.target.value));
                }}
                placeholder="e.g., AETHER-02 Reference Studio Monitor"
                className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 text-[14px] text-ink outline-none focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="editor-slug"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                URL SLUG *
              </label>
              <input
                id="editor-slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[12px] text-ink outline-none focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="editor-sku"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                SERIAL SKU *
              </label>
              <input
                id="editor-sku"
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[12px] uppercase text-ink outline-none focus:border-ink"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="editor-category"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                ARCHITECTURAL DEPARTMENT (LIVE CATEGORIES) *
              </label>
              <select
                id="editor-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 text-[13.5px] text-ink outline-none focus:border-ink"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="editor-price"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                PRICE (USD) *
              </label>
              <input
                id="editor-price"
                type="number"
                min={0}
                step="1"
                required
                value={priceUsd}
                onChange={(e) => setPriceUsd(e.target.value)}
                className="tabular h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[13px] text-ink outline-none focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="editor-compare-price"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                COMPARE-AT PRICE (USD)
              </label>
              <input
                id="editor-compare-price"
                type="number"
                min={0}
                step="1"
                value={compareAtPriceUsd}
                onChange={(e) => setCompareAtPriceUsd(e.target.value)}
                placeholder="Optional"
                className="tabular h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[13px] text-ink outline-none focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="editor-stock"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                ARCHIVE STOCK COUNT *
              </label>
              <input
                id="editor-stock"
                type="number"
                min={0}
                step="1"
                required
                value={stockCount}
                onChange={(e) => setStockCount(e.target.value)}
                className="tabular h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[13px] text-ink outline-none focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="editor-dimensions"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                DIMENSIONS
              </label>
              <input
                id="editor-dimensions"
                type="text"
                value={dimensions}
                onChange={(e) => setDimensions(e.target.value)}
                className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[12px] text-ink outline-none focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="editor-weight"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                MASS / WEIGHT
              </label>
              <input
                id="editor-weight"
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 font-mono text-[12px] text-ink outline-none focus:border-ink"
              />
            </div>

            <div>
              <label
                htmlFor="editor-materials"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                MATERIALS (COMMA-SEPARATED)
              </label>
              <input
                id="editor-materials"
                type="text"
                value={materialsInput}
                onChange={(e) => setMaterialsInput(e.target.value)}
                className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 text-[13px] text-ink outline-none focus:border-ink"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="editor-tagline"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                EDITORIAL TAGLINE
              </label>
              <input
                id="editor-tagline"
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="h-11 w-full rounded-xl border border-line-strong bg-canvas px-3.5 text-[13.5px] text-ink outline-none focus:border-ink"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="editor-description"
                className="mb-1.5 block font-mono text-[10px] tracking-[0.18em] text-muted"
              >
                FULL ARCHITECTURAL DESCRIPTION
              </label>
              <textarea
                id="editor-description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-line-strong bg-canvas p-3.5 text-[13.5px] leading-relaxed text-ink outline-none focus:border-ink"
              />
            </div>
          </div>

          {/* Curation Status Switches */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: "Featured", value: isFeatured, set: setIsFeatured },
              { label: "Bestseller", value: isBestseller, set: setIsBestseller },
              { label: "New Arrival", value: isNewArrival, set: setIsNewArrival },
            ].map((sw) => (
              <button
                key={sw.label}
                type="button"
                role="switch"
                aria-checked={sw.value}
                onClick={() => sw.set(!sw.value)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3 py-2.5 font-mono text-[10px] tracking-wider transition-colors",
                  sw.value
                    ? "border-ink bg-ink text-canvas"
                    : "border-line bg-surface text-muted",
                )}
              >
                <span>{sw.label.toUpperCase()}</span>
                <span>{sw.value ? "ON" : "OFF"}</span>
              </button>
            ))}
          </div>

          {errorMsg && (
            <p
              role="alert"
              className="rounded-xl border border-accent/45 bg-accent/10 px-3.5 py-2.5 font-mono text-[10.5px] text-accent"
            >
              {errorMsg}
            </p>
          )}
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-3 border-t border-line bg-surface px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-full border border-line-strong bg-canvas px-5 font-mono text-[10.5px] tracking-wider text-ink"
          >
            CANCEL
          </button>
          <MagneticButton
            type="submit"
            size="md"
            variant="primary"
            disabled={isPending || isUploading}
          >
            <Check className="size-4" strokeWidth={2} />
            {isPending ? "Syncing to Supabase…" : "Save Object to Live Storefront"}
          </MagneticButton>
        </footer>
      </form>
    </motion.aside>
  );
}

export function ProductEditorDrawer({
  open,
  product,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  product: CatalogProduct | null;
  categories: Category[];
  onClose: () => void;
  onSaved: (saved: CatalogProduct, message: string) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="product-editor-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex justify-end bg-[#0D0C0B]/55 backdrop-blur-sm"
        >
          <ProductEditorBody
            key={product?.id ?? "new-commission"}
            product={product}
            categories={categories}
            onClose={onClose}
            onSaved={onSaved}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
