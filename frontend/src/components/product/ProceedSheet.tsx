'use client';

import { useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { resolveImageUrl } from '@/lib/api';
import { formatINR } from '@/lib/format';
import type { EmiPlan, ProductDetail, Variant } from '@/schemas/product';

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-[13px]">
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

  useEffect(() => {
    if (open) setConfirmed(false);
  }, [open]);

  // canvas-confetti celebration burst on confirm.
  useEffect(() => {
    if (!confirmed) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const confetti = (await import('canvas-confetti')).default;
      if (cancelled) return;
      const defaults = { origin: { y: 0.5 }, colors: BRAND_COLORS, zIndex: 200 };
      const fire = (ratio: number, opts: Parameters<typeof confetti>[0]) =>
        confetti({ ...defaults, ...opts, particleCount: Math.floor(180 * ratio) });
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }, 400);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [confirmed]);

  const hasCashback = plan.cashbackAmount > 0;

  return (
    <Sheet open={open} onClose={onClose} title={confirmed ? undefined : 'Review your plan'}>
      {confirmed ? (
        <SuccessScreen onClose={onClose} />
      ) : (
        <ReviewScreen
          plan={plan}
          product={product}
          variant={variant}
          hasCashback={hasCashback}
          onConfirm={() => setConfirmed(true)}
        />
      )}
    </Sheet>
  );
}

// ── Lottie player using lottie-web directly ─────────────────────────────────
// lottie-web plays the real JSON animation with the drawn checkmark,
// expanding rings, and stars from the "Successful" animation.

function LottieSuccess() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let anim: { destroy(): void } | null = null;

    import('lottie-web').then((lottie) => {
      if (!containerRef.current) return;
      anim = lottie.default.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: true,
        path: '/success.json',
      });
    });

    return () => {
      anim?.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="mx-auto"
      style={{ width: 140, height: 140 }}
      aria-label="Payment confirmed animation"
    />
  );
}

// ── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <LottieSuccess />
      <h3 className="mt-2 text-[22px] font-extrabold tracking-[-0.015em] text-ink">
        Plan confirmed!
      </h3>
      <p className="mt-2 max-w-[28ch] text-[13px] leading-relaxed text-ink-muted">
        Your EMI plan is locked in. In the full 1Fi app you&apos;d pledge your mutual funds next.
      </p>
      <Button className="mt-6 w-full" size="lg" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}

// ── Review screen ─────────────────────────────────────────────────────────────

function ReviewScreen({
  plan,
  product,
  variant,
  hasCashback,
  onConfirm,
}: {
  plan: EmiPlan;
  product: ProductDetail;
  variant: Variant;
  hasCashback: boolean;
  onConfirm: () => void;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/60 p-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-white">
          <img
            src={resolveImageUrl(variant.imageUrl ?? product.imageUrl)}
            alt={product.name}
            className="h-full w-full object-contain p-1"
          />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand">{product.brand}</p>
          <p className="truncate text-[14px] font-semibold text-ink">{product.name}</p>
          <p className="text-[12px] text-ink-muted">{variant.label}</p>
        </div>
      </div>

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

      <div className="mt-3 divide-y divide-zinc-100 rounded-2xl border border-zinc-100 px-4 py-1">
        <Row label="Item price" value={formatINR(variant.price)} />
        <Row label="Total payable" value={formatINR(plan.totalPayable)} />
        {plan.isNoCost
          ? <Row label="Interest" value="₹0 · No-cost" />
          : <Row label="Interest" value={formatINR(plan.interestPaid)} />
        }
        {hasCashback && <Row label="Cashback" value={`− ${formatINR(plan.cashbackAmount)}`} />}
        <Row label="Effective cost" value={formatINR(plan.effectiveCost)} strong />
      </div>

      <Button className="mt-5 w-full" size="lg" onClick={onConfirm}>
        <ShieldCheck className="h-[18px] w-[18px]" />
        Confirm &amp; continue
      </Button>
      <p className="mt-2 text-center text-[11px] text-ink-muted">
        Backed by your mutual funds · No CIBIL impact
      </p>
    </div>
  );
}
