import { useMemo } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { ProductSummary } from '@/schemas/product';
import { onImageError, resolveImageUrl } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Swatch } from '@/components/ui/Swatch';

export function ProductCard({ product }: { product: ProductSummary }) {
  // All derived values memoised on product.id — O(1) on re-render, only
  // recomputes when the product object itself changes.
  const { thumb, hasDiscount, fromMonthly, noCostExists, colours } = useMemo(() => {
    const noCostPlans = product.emiPlans.filter((p) => p.isNoCost);
    const monthly = noCostPlans.length
      ? noCostPlans.reduce((min, p) => Math.min(min, p.monthlyAmount), Infinity)
      : product.lowestMonthly;

    // Deduplicate colours with a Map — O(V) build, O(1) lookup, insertion-order
    // preserved so swatches always render in the same order.
    const colourMap = new Map<string, string>();
    for (const v of product.variants) {
      if (v.hexColor && !colourMap.has(v.hexColor)) {
        colourMap.set(v.hexColor, v.color ?? '');
      }
    }

    return {
      thumb: resolveImageUrl(product.variants[0]?.imageUrl ?? product.imageUrl),
      hasDiscount: product.discountPercent > 0,
      fromMonthly: monthly,
      noCostExists: noCostPlans.length > 0,
      colours: Array.from(colourMap, ([hex, name]) => ({ hex, name })),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="flex items-center gap-4 rounded-card border border-zinc-100 bg-white p-3.5 shadow-card outline-none focus:outline-none focus-visible:outline-none"
    >
      <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-50">
        <img
          src={thumb}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={onImageError}
          className="h-full w-full object-contain p-2"
        />
        {hasDiscount && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-green-500 px-1.5 py-0.5 text-[9px] font-bold text-white shadow">
            {product.discountPercent}% OFF
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand">
          {product.brand}
        </p>
        <h3 className="mt-0.5 line-clamp-1 text-[15px] font-semibold tracking-[-0.01em] text-ink">
          {product.name}
        </h3>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[16px] font-bold text-ink">{formatINR(product.minPrice)}</span>
          {hasDiscount && (
            <span className="text-[12px] text-zinc-400 line-through">{formatINR(product.mrp)}</span>
          )}
        </div>

        {fromMonthly != null && (
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {noCostExists && <Badge tone="brand">0% EMI</Badge>}
            <span className="text-[12px] text-ink-muted">from {formatINR(fromMonthly)}/mo</span>
          </div>
        )}

        {colours.length > 1 && (
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              {colours.slice(0, 5).map((c) => (
                <Swatch key={c.hex} hex={c.hex} title={c.name} size={14} />
              ))}
            </div>
            <span className="text-[11px] text-ink-muted">{colours.length} colours</span>
          </div>
        )}
      </div>

      <ChevronRight className="h-5 w-5 shrink-0 text-zinc-300" />
    </Link>
  );
}
