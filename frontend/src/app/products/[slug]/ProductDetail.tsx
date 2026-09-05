'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, IndianRupee } from 'lucide-react';
import type { EmiPlan, ProductDetail as ProductDetailType, Variant } from '@/schemas/product';
import { recomputePlans } from '@/lib/emi';
import { formatINR } from '@/lib/format';
import { AppShell } from '@/components/layout/AppShell';
import { AnimatedAmount } from '@/components/ui/AnimatedAmount';
import { Badge } from '@/components/ui/Badge';
import { Gallery } from '@/components/product/Gallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import { EmiPlanSelector } from '@/components/product/EmiPlanSelector';
import { TrustBadges } from '@/components/product/TrustBadges';
import { ProceedBar } from '@/components/product/ProceedBar';
import { ProceedSheet } from '@/components/product/ProceedSheet';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

export function ProductDetail({ product }: { product: ProductDetailType }) {
  const variants = product.variants;

  // Single-pass reduce — avoids spreading the array onto the call stack.
  const basePrice = useMemo(
    () =>
      variants.length
        ? variants.reduce((min, v) => Math.min(min, v.price), Infinity)
        : product.minPrice,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [product.id],
  );

  const [selectedVariant, setSelectedVariant] = useState<Variant>(
    variants.find((v) => v.inStock) ?? variants[0],
  );

  // EMI plans recomputed live for the selected variant's price.
  // Depend on the variant price (primitive) and plan count rather than
  // the array reference — avoids spurious recomputes when the same array
  // is recreated from the server response.
  const plans = useMemo(
    () => recomputePlans(product.emiPlans, selectedVariant.price),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedVariant.price, product.emiPlans.length],
  );

  // Map<id, EmiPlan> — O(1) lookup instead of O(n) find on every render.
  const planMap = useMemo(
    () => new Map(plans.map((p) => [p.id, p])),
    [plans],
  );

  const [selectedPlanId, setSelectedPlanId] = useState<string>(
    (plans.find((p) => p.isRecommended) ?? plans[0])?.id,
  );
  const selectedPlan: EmiPlan = planMap.get(selectedPlanId) ?? plans[0];

  const [sheetOpen, setSheetOpen] = useState(false);

  const price = selectedVariant.price;
  const hasDiscount = product.mrp > price;

  return (
    <AppShell className="bg-white pb-[calc(7rem+env(safe-area-inset-bottom))]">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-zinc-100 bg-white/95 px-4 py-3 backdrop-blur-md">
        <Link
          href="/shop"
          aria-label="Back to shop"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white text-ink-soft transition-colors hover:bg-zinc-50"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={2} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-ink">{product.name}</p>
          <p className="truncate text-[11px] text-ink-muted">
            {product.brand} · {selectedVariant.label}
          </p>
        </div>
      </header>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-5 px-4 pt-4"
      >
        <motion.div variants={item}>
          <Gallery
            variants={variants}
            selectedId={selectedVariant.id}
            productName={product.name}
            discountPercent={hasDiscount ? product.discountPercent : 0}
          />
        </motion.div>

        {/* Brand · name · price */}
        <motion.div variants={item}>
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-brand">
            {product.brand}
          </p>
          <h1 className="mt-0.5 text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink">
            {product.name}
          </h1>

          <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <AnimatedAmount value={formatINR(price)} className="text-[26px] font-bold text-ink" />
            {hasDiscount && (
              <>
                <span className="text-[15px] text-zinc-400 line-through">
                  {formatINR(product.mrp)}
                </span>
                <Badge tone="green">Save {formatINR(product.mrp - price)}</Badge>
              </>
            )}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <IndianRupee className="h-3.5 w-3.5 text-brand" strokeWidth={2.5} />
            <span className="flex items-baseline text-[13px] font-semibold text-brand">
              <AnimatedAmount value={formatINR(selectedPlan.monthlyAmount)} />
              /mo
            </span>
            <span className="text-[12px] text-ink-muted">
              · {selectedPlan.tenureMonths} months ·{' '}
              {selectedPlan.isNoCost ? '0% interest' : `${selectedPlan.interestRate}% p.a.`}
            </span>
          </div>

          {product.description && (
            <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{product.description}</p>
          )}
        </motion.div>

        {/* Variant selector */}
        {variants.length > 1 && (
          <motion.section variants={item} aria-label="Choose variant">
            <p className="mb-2.5 text-[14px] font-bold text-ink">
              Choose variant
              <span className="ml-1.5 font-normal text-ink-muted">— {selectedVariant.label}</span>
            </p>
            <VariantSelector
              variants={variants}
              selectedId={selectedVariant.id}
              basePrice={basePrice}
              onSelect={setSelectedVariant}
            />
          </motion.section>
        )}

        {/* EMI plan selector */}
        {plans.length > 0 && (
          <motion.section variants={item} aria-label="Choose EMI plan">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[14px] font-bold text-ink">Choose your EMI plan</p>
              <Badge tone="brand">Backed by mutual funds</Badge>
            </div>
            <EmiPlanSelector
              plans={plans}
              selectedId={selectedPlan.id}
              onSelect={(p) => setSelectedPlanId(p.id)}
            />
          </motion.section>
        )}

        <motion.div variants={item}>
          <TrustBadges />
        </motion.div>
      </motion.div>

      <ProceedBar
        variant={selectedVariant}
        plan={selectedPlan}
        onProceed={() => setSheetOpen(true)}
      />
      <ProceedSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        product={product}
        variant={selectedVariant}
        plan={selectedPlan}
      />
    </AppShell>
  );
}
