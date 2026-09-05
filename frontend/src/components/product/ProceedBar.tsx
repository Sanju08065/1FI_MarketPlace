'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { AnimatedAmount } from '@/components/ui/AnimatedAmount';
import { cn } from '@/lib/cn';
import { formatINR } from '@/lib/format';
import type { EmiPlan, Variant } from '@/schemas/product';

export function ProceedBar({
  variant,
  plan,
  onProceed,
}: {
  variant: Variant;
  plan: EmiPlan;
  onProceed: () => void;
}) {
  const outOfStock = !variant.inStock;

  return (
    <motion.div
      initial={{ y: 90 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 26, stiffness: 280, delay: 0.15 }}
      className="fixed inset-x-0 bottom-0 z-40 flex justify-center"
    >
      <div className="flex w-full max-w-[480px] items-center gap-3 border-t border-zinc-100 bg-white px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_24px_rgba(20,14,50,0.06)] sm:border-x sm:border-zinc-200/70">
        {/* Price block */}
        <div className="min-w-0 shrink-0">
          <p className="flex items-baseline gap-0.5 text-[19px] font-extrabold leading-none text-ink">
            <AnimatedAmount value={formatINR(plan.monthlyAmount)} />
            <span className="text-[12px] font-semibold text-ink-muted">/mo</span>
          </p>
          <p className="mt-1 truncate text-[11px] font-medium text-ink-muted">
            {plan.tenureMonths} months · {plan.isNoCost ? '0% interest' : `${plan.interestRate}% p.a.`}
          </p>
        </div>

        {/* CTA — opens the review sheet directly (no loading animation) */}
        <button
          type="button"
          onClick={outOfStock ? undefined : onProceed}
          disabled={outOfStock}
          aria-label="Proceed with selected plan"
          className={cn(
            'group relative flex h-[52px] flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-full text-[15px] font-bold text-white transition-transform active:scale-[0.98]',
            outOfStock
              ? 'cursor-not-allowed bg-zinc-300 active:scale-100'
              : 'bg-gradient-to-br from-[#8b45e8] to-[#5f2fd1] shadow-cta',
          )}
        >
          {outOfStock ? (
            'Out of stock'
          ) : (
            <>
              {/* glossy top highlight */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-full bg-gradient-to-b from-white/25 to-transparent" />
              {/* shine sweep on hover */}
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <span className="relative">Proceed</span>
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-200 group-hover:translate-x-0.5">
                <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.75} />
              </span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
