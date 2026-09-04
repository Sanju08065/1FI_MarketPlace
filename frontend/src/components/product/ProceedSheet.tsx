'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { resolveImageUrl } from '@/lib/api';
import { formatINR } from '@/lib/format';
import type { EmiPlan, ProductDetail, Variant } from '@/schemas/product';

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-[13px]">
      <span className="shrink-0 text-ink-muted">{label}</span>
      <span className={strong ? 'truncate font-bold text-ink' : 'truncate font-semibold text-ink-soft'}>
        {value}
      </span>
    </div>
  );
}

const BRAND_COLORS = ['#712CDC', '#22c55e', '#f59e0b', '#ec4899', '#38bdf8', '#a855f7'];

export function ProceedSheet({
  open,
  onClose,
  product,
  variant,
  plan,
}: {
  open: boolean;
  onClose: () => void;
  product: ProductDetail;
  variant: Variant;
  plan: EmiPlan;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setConfirmed(false);
  }, [open]);

  // Unique, finance-themed celebration: ₹ / ✨ / 💜 burst radially out of the
  // checkmark (canvas-confetti), instead of paper raining from the top.
  useEffect(() => {
    if (!confirmed) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const confetti = (await import('canvas-confetti')).default;
      if (cancelled) return;

      const rect = badgeRef.current?.getBoundingClientRect();
      const origin = rect
        ? {
            x: (rect.left + rect.width / 2) / window.innerWidth,
            y: (rect.top + rect.height / 2) / window.innerHeight,
          }
        : { x: 0.5, y: 0.42 };

      const money = [
        confetti.shapeFromText({ text: '₹', scalar: 2.2 }),
        confetti.shapeFromText({ text: '✨', scalar: 2 }),
        confetti.shapeFromText({ text: '💜', scalar: 1.9 }),
      ];

      // Radial pop of money/emoji straight out of the check
      confetti({
        origin,
        particleCount: 46,
        spread: 360,
        startVelocity: 24,
        gravity: 0.65,
        decay: 0.9,
        ticks: 180,
        scalar: 1.7,
        flat: true,
        zIndex: 200,
        shapes: money,
      });
      // Fine brand-colour sparkle ring around it
      confetti({
        origin,
        particleCount: 55,
        spread: 360,
        startVelocity: 34,
        gravity: 0.9,
        decay: 0.92,
        ticks: 150,
        scalar: 0.9,
        zIndex: 200,
        colors: BRAND_COLORS,
      });
      // Gentle second pop
      window.setTimeout(() => {
        if (cancelled) return;
        confetti({
          origin,
          particleCount: 22,
          spread: 360,
          startVelocity: 16,
          gravity: 0.6,
          ticks: 160,
          scalar: 1.5,
          flat: true,
          zIndex: 200,
          shapes: money,
        });
      }, 260);
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [confirmed]);

  const hasCashback = plan.cashbackAmount > 0;

  return (
    <Sheet open={open} onClose={onClose} title={confirmed ? undefined : 'Review your plan'}>
      {confirmed ? (
        <div className="flex flex-col items-center px-1 pb-1 pt-8 text-center">
          {/* Badge with aligned pulse rings */}
          <div className="relative flex h-[84px] w-[84px] items-center justify-center">
            <span className="animate-success-ring absolute inset-0 rounded-full border-2 border-green-400" />
            <span
              className="animate-success-ring absolute inset-0 rounded-full border-2 border-green-400"
              style={{ animationDelay: '0.25s' }}
            />
            <div
              ref={badgeRef}
              className="animate-scale-in relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-[0_14px_34px_rgba(34,197,94,0.45)]"
            >
              <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-white/35 to-transparent" />
              <Check className="relative h-10 w-10 text-white" strokeWidth={3} />
            </div>
          </div>

          <h3
            className="animate-fade-in mt-5 text-[22px] font-extrabold tracking-[-0.01em] text-ink"
            style={{ animationDelay: '0.12s' }}
          >
            Plan confirmed
          </h3>
          <p
            className="animate-fade-in mt-1.5 max-w-[32ch] text-[13px] leading-relaxed text-ink-muted"
            style={{ animationDelay: '0.18s' }}
          >
            Your {plan.isNoCost ? 'no-cost ' : ''}EMI plan is locked in. In the full 1Fi app
            you&apos;d confirm your mutual-fund pledge next.
          </p>

          {/* Confirmation ticket */}
          <div
            className="animate-slide-up mt-6 w-full overflow-hidden rounded-2xl border border-zinc-100 bg-white text-left shadow-card"
            style={{ animationDelay: '0.24s' }}
          >
            <div className="flex items-center gap-3 p-3.5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
                <img
                  src={resolveImageUrl(variant.imageUrl ?? product.imageUrl)}
                  alt={product.name}
                  className="h-full w-full object-contain p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-bold text-ink">{product.name}</p>
                <p className="truncate text-[12px] text-ink-muted">{variant.label}</p>
              </div>
              <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-600">
                Confirmed
              </span>
            </div>

            <div className="mx-3.5 border-t border-dashed border-zinc-200" />

            <div className="divide-y divide-zinc-100 px-3.5 py-1">
              <Row label="Monthly instalment" value={`${formatINR(plan.monthlyAmount)}/mo`} strong />
              <Row
                label="Tenure"
                value={`${plan.tenureMonths} months · ${plan.isNoCost ? '0% interest' : `${plan.interestRate}% p.a.`}`}
              />
              <Row label="Total payable" value={formatINR(plan.totalPayable)} />
              {hasCashback && <Row label="Cashback" value={`− ${formatINR(plan.cashbackAmount)}`} />}
              <Row label="Effective cost" value={formatINR(plan.effectiveCost)} strong />
            </div>
          </div>

          <div className="animate-fade-in w-full" style={{ animationDelay: '0.34s' }}>
            <Button className="mt-5 w-full" size="lg" onClick={onClose}>
              Done
            </Button>
            <p className="mt-2 text-[11px] text-ink-muted">No CIBIL impact · Cancel anytime</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Product summary */}
          <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-white">
              <img
                src={resolveImageUrl(variant.imageUrl ?? product.imageUrl)}
                alt={product.name}
                className="h-full w-full object-contain p-1"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand">
                {product.brand}
              </p>
              <p className="truncate text-[14px] font-semibold text-ink">{product.name}</p>
              <p className="text-[12px] text-ink-muted">{variant.label}</p>
            </div>
          </div>

          {/* Monthly hero */}
          <div className="mt-4 flex items-end justify-between rounded-2xl bg-gradient-to-br from-brand to-brand-700 px-4 py-3.5 text-white shadow-cta">
            <div>
              <p className="text-[11px] font-medium text-white/80">You pay</p>
              <p className="text-[24px] font-bold leading-tight">
                {formatINR(plan.monthlyAmount)}
                <span className="text-[13px] font-normal text-white/80">/mo</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-white/80">{plan.tenureMonths} months</p>
              <p className="text-[12px] font-semibold">
                {plan.isNoCost ? '0% · No-cost EMI' : `${plan.interestRate}% p.a.`}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <div className="mt-3 divide-y divide-zinc-100 rounded-2xl border border-zinc-100 px-4 py-1">
            <Row label="Item price" value={formatINR(variant.price)} />
            <Row label="Total payable" value={formatINR(plan.totalPayable)} />
            {plan.isNoCost ? (
              <Row label="Interest" value="₹0 · No-cost" />
            ) : (
              <Row label="Interest" value={formatINR(plan.interestPaid)} />
            )}
            {hasCashback && <Row label="Cashback" value={`− ${formatINR(plan.cashbackAmount)}`} />}
            <Row label="Effective cost" value={formatINR(plan.effectiveCost)} strong />
          </div>

          <Button className="mt-5 w-full" size="lg" onClick={() => setConfirmed(true)}>
            <ShieldCheck className="h-[18px] w-[18px]" />
            Confirm &amp; continue
          </Button>
          <p className="mt-2 text-center text-[11px] text-ink-muted">
            Backed by your mutual funds · No CIBIL impact
          </p>
        </div>
      )}
    </Sheet>
  );
}
