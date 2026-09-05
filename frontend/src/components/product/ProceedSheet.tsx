'use client';

import { useEffect, useState } from 'react';
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

  // Real canvas-confetti burst on success.
  useEffect(() => {
    if (!confirmed) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      const confetti = (await import('canvas-confetti')).default;
      if (cancelled) return;
      const defaults = { origin: { y: 0.55 }, colors: BRAND_COLORS, zIndex: 200 };
      const fire = (ratio: number, opts: Parameters<typeof confetti>[0]) =>
        confetti({ ...defaults, ...opts, particleCount: Math.floor(200 * ratio) });
      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }, 200);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [confirmed]);

  const hasCashback = plan.cashbackAmount > 0;

  return (
    <Sheet open={open} onClose={onClose} title={confirmed ? undefined : 'Review your plan'}>
      {confirmed ? (
        <SuccessScreen plan={plan} product={product} variant={variant} onClose={onClose} hasCashback={hasCashback} />
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

// ── Success screen ─────────────────────────────────────────────────────────

function SuccessScreen({
  plan,
  product,
  variant,
  onClose,
  hasCashback,
}: {
  plan: EmiPlan;
  product: ProductDetail;
  variant: Variant;
  onClose: () => void;
  hasCashback: boolean;
}) {
  return (
    <div className="flex flex-col items-center px-2 pb-2 pt-4 text-center">
      {/* Lottie success animation — loaded from public/success.json (self-hosted, no CDN) */}
      <LottieSuccess />

      <h3 className="mt-2 text-[21px] font-extrabold tracking-[-0.015em] text-ink">
        Plan confirmed!
      </h3>
      <p className="mt-1 text-[13px] text-ink-muted">
        Your EMI plan is locked in and ready to go.
      </p>

      {/* Clean receipt card */}
      <div className="mt-5 w-full overflow-hidden rounded-2xl border border-zinc-100 bg-white text-left">
        {/* Product row */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-zinc-100 bg-zinc-50">
            <img
              src={resolveImageUrl(variant.imageUrl ?? product.imageUrl)}
              alt={product.name}
              className="h-full w-full object-contain p-1"
              loading="eager"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-ink">{product.name}</p>
            <p className="truncate text-[11px] text-ink-muted">{variant.label}</p>
          </div>
          <span className="shrink-0 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-green-600">
            ✓ Done
          </span>
        </div>

        <div className="mx-4 border-t border-dashed border-zinc-200" />

        {/* EMI summary */}
        <div className="px-4 py-2">
          <div className="flex items-center justify-between py-2">
            <span className="text-[13px] font-bold text-ink">Monthly instalment</span>
            <span className="text-[15px] font-extrabold text-brand">
              {formatINR(plan.monthlyAmount)}<span className="text-[11px] font-medium text-ink-muted">/mo</span>
            </span>
          </div>
          <div className="divide-y divide-zinc-100">
            <Row label="Duration" value={`${plan.tenureMonths} months`} />
            <Row label="Interest" value={plan.isNoCost ? '0% · No-cost EMI' : `${plan.interestRate}% p.a.`} />
            <Row label="Total payable" value={formatINR(plan.totalPayable)} />
            {hasCashback && <Row label="Cashback" value={`− ${formatINR(plan.cashbackAmount)}`} />}
            <Row label="Effective cost" value={formatINR(plan.effectiveCost)} strong />
          </div>
        </div>

        {/* Powered by strip */}
        <div className="flex items-center justify-center gap-1.5 border-t border-zinc-100 bg-brand-50/50 py-2.5">
          <ShieldCheck className="h-3.5 w-3.5 text-brand" />
          <span className="text-[11px] font-semibold text-brand">
            Backed by mutual funds · No CIBIL impact
          </span>
        </div>
      </div>

      <Button className="mt-4 w-full" size="lg" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}

// ── Lottie player (lazy-loaded, SSR-safe) ──────────────────────────────────

function LottieSuccess() {
  const [Player, setPlayer] = useState<React.ComponentType<{
    src: string; autoplay: boolean; loop: boolean;
    style?: React.CSSProperties;
  }> | null>(null);

  useEffect(() => {
    // Dynamically import so the WASM-based Lottie player never hits SSR.
    import('@lottiefiles/dotlottie-react').then((mod) => {
      setPlayer(() => mod.DotLottieReact as typeof Player);
    });
  }, []);

  if (!Player) {
    // Lightweight fallback: a static green circle with a check while Lottie loads.
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500 text-white shadow-[0_8px_24px_rgba(34,197,94,0.4)]">
        <svg viewBox="0 0 24 24" fill="none" className="h-12 w-12">
          <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  }

  return (
    <Player
      src="/success.json"
      autoplay
      loop={false}
      style={{ width: 120, height: 120 }}
    />
  );
}

// ── Review screen (unchanged design) ──────────────────────────────────────

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
