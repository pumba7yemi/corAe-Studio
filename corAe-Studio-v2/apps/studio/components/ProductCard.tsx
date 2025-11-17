"use client";

import Image from "next/image";
import { useCallback, useMemo, useState } from "react";

/**
 * ProductCard — Choice Plus Supermarket
 * Includes a working “Add to Cart” button.
 * Uses localStorage to persist the cart.
 */

type Product = {
  id: string;
  sku: string;
  name: string;
  price: number; // AED
  unit?: string; // "pc" | "kg" | "box" etc.
  brand?: string;
  vendor?: string; // e.g., "GASJ", "Iffco"
  imageUrl?: string; // /products/<SKU>.jpg or full URL
};

type CartItem = {
  sku: string;
  name: string;
  price: number;
  qty: number;
  imageUrl?: string;
  unit?: string;
  vendor?: string;
};

function joinClasses(...cls: Array<string | false | null | undefined>) {
  return cls.filter(Boolean).join(" ");
}

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("cart");
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("cart", JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("cart:updated", { detail: { items } }));
}

function addToCart(item: Omit<CartItem, "qty">, qty = 1): CartItem[] {
  const current = readCart();
  const idx = current.findIndex((c) => c.sku === item.sku);
  if (idx >= 0) {
    current[idx].qty += qty;
  } else {
    current.unshift({ ...item, qty });
  }
  writeCart(current);
  return current;
}

export default function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const {
    sku,
    name,
    price,
    unit = "pc",
    brand,
    vendor,
    imageUrl = `/products/${sku}.jpg`,
  } = product;

  const [adding, setAdding] = useState(false);
  const priceText = useMemo(() => `AED ${price.toFixed(2)}`, [price]);

  const onAdd = useCallback(async () => {
    try {
      setAdding(true);
      addToCart({ sku, name, price, imageUrl, unit, vendor }, 1);
    } finally {
      setTimeout(() => setAdding(false), 400);
    }
  }, [sku, name, price, imageUrl, unit, vendor]);

  return (
    <article
      className={joinClasses(
        "group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-lg",
        "dark:border-neutral-800 dark:bg-neutral-900",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
          className="object-cover transition duration-300 group-hover:scale-105"
          priority={false}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-center justify-between">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{name}</h3>
          {brand && (
            <span className="ml-2 shrink-0 rounded-md border border-neutral-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
              {brand}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold">{priceText}</span>
          <span className="text-xs text-neutral-500">/ {unit}</span>
        </div>

        <div className="mt-1 flex items-center justify-between text-xs text-neutral-500">
          <span className="font-mono">SKU: {sku}</span>
          {vendor && (
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] dark:bg-neutral-800">
              {vendor}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <button
          onClick={onAdd}
          disabled={adding}
          className={joinClasses(
            "mt-2 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium",
            "border-neutral-300 bg-neutral-50 text-neutral-900 hover:bg-neutral-100",
            "dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700",
            adding && "opacity-60 cursor-not-allowed"
          )}
          aria-label={`Add ${name} to cart`}
        >
          {adding ? "Adding…" : "Add to cart"}
        </button>
      </div>

      {/* Hover ring */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 ring-neutral-900/0 transition group-hover:ring-2 group-hover:ring-neutral-900/10 dark:group-hover:ring-white/10" />
    </article>
  );
}