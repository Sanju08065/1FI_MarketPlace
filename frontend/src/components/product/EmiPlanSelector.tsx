'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Tag, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatINR } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import type { EmiPlan } from '@/schemas/product';

export function EmiPlanSelector({
  plans,
  selectedId,
  onSelect,
}: {
  plans: EmiPlan[];
  selectedId: string;
  onSelect: (plan: EmiPlan) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {plans.map((plan) => {
        const selected = plan.id === selectedId;
        const hasCashback = plan.cashbackAmount > 0;

        return (
          <motion.button
            key={plan.id}
            type="button"
            onClick={() => onSelect(plan)}
            aria-pressed={selected}
            whileTap={{ scale: 0.985 }}
            className={cn(
              'relative flex w-full flex-col rounded-2xl border px-4 py-3.5 text-left transition-colors duration-200',
              selected
                ? 'border-brand bg-brand-50/70 shadow-ring'
                : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-card',
            )}
          >
            <div className="flex items-start gap-3">
              {/* Radio */}
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200',
                  selected ? 'border-brand bg-brand' : 'border-zinc-300',
                )}
              >
                <AnimatePresence>
                  {selected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: 'spring', damping: 15, stiffness: 320 }}
                    >
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-ink">{plan.tenureMonths} months</span>
                    {plan.isRecommended && <Badge tone="green">Best value</Badge>}
                  </div>
                  <span className="text-[16px] font-bold text-ink">
                    {formatINR(plan.monthlyAmount)}
                    <span className="text-[12px] font-normal text-ink-muted">/mo</span>
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={cn(
                      'text-[12px] font-semibold',
                      plan.isNoCost ? 'text-brand' : 'text-amber-600',
                    )}
                  >
                    {plan.isNoCost
                      ? '0% interest · No-cost EMI'
                      : `${plan.interestRate}% p.a. reducing balance`}
                  </span>
                  {hasCashback && (
                    <span className="flex items-center gap-1 text-[11.5px] font-semibold text-green-700">
                      <Tag className="h-3 w-3" />
                      {plan.cashbackLabel}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown — expands only for the selected plan */}
            <AnimatePresence initial={false}>
              {selected && (
                <motion.div
                  key="breakdown"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-white/80 px-3 py-2 text-[11.5px]">
                    <span className="flex items-center gap-1.5 text-ink-muted">
                      <TrendingDown className="h-3.5 w-3.5 shrink-0" />
                      Total payable {formatINR(plan.totalPayable)}
                    </span>
                    {plan.isNoCost ? (
                      <span className="font-semibold text-brand">
                        {hasCashback ? `Save ${formatINR(plan.cashbackAmount)}` : 'No extra cost'}
                      </span>
                    ) : (
                      <span className="font-semibold text-amber-600">
                        +{formatINR(plan.interestPaid)} interest
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
