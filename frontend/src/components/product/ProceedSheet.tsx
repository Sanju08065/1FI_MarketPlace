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
  useEffect(() => { if (open) setConfirmed(false); }, [open]);
  const hasCashback = plan.cashbackAmount > 0;

  return (
    <Sheet open={open} onClose={onClose} title={confirmed ? undefined : 'Review your plan'}>
      {confirmed ? (
        <SuccessScreen plan={plan} onClose={onClose} />
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

// ─────────────────────────────────────────────────────────────────────────────
// "Locked In" success screen
// Concept: your mutual-fund backed EMI plan is now SECURED — like a vault.
// A branded shield draws itself, a lock snaps in, particles float upward.
// All pure CSS + inline SVG — zero library, zero lag on mobile.
// ─────────────────────────────────────────────────────────────────────────────

function SuccessScreen({ plan, onClose }: { plan: EmiPlan; onClose: () => void }) {
  return (
    <div className="success-bg flex flex-col items-center overflow-hidden rounded-2xl bg-gradient-to-b from-[#1a0845] to-[#2d0e6e] px-6 py-8 text-center">

      {/* ── Particle field ──────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {[
          { cls: 'p1', s: 8,  c: '#a78bfa', t: '22%', l: '14%' },
          { cls: 'p2', s: 6,  c: '#712CDC', t: '35%', l: '72%' },
          { cls: 'p3', s: 5,  c: '#c4b5fd', t: '58%', l: '28%' },
          { cls: 'p4', s: 7,  c: '#8b5cf6', t: '68%', l: '80%' },
          { cls: 'p5', s: 6,  c: '#a78bfa', t: '42%', l: '55%' },
          { cls: 'p6', s: 5,  c: '#c4b5fd', t: '75%', l: '45%' },
        ].map(({ cls, s, c, t, l }) => (
          <span
            key={cls}
            className={`particle ${cls} absolute`}
            style={{ width: s, height: s, backgroundColor: c, top: t, left: l }}
          />
        ))}
      </div>

      {/* ── Shield scene ────────────────────────────────────────── */}
      <div className="relative flex h-[180px] w-[180px] items-center justify-center">

        {/* Ambient glow */}
        <div
          aria-hidden
          className="glow-anim absolute h-[180px] w-[180px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(113,44,220,0.55) 0%, transparent 70%)',
          }}
        />

        {/* Orbit rings */}
        <svg
          aria-hidden
          viewBox="0 0 180 180"
          className="absolute inset-0 h-full w-full"
        >
          <circle
            cx="90" cy="90" r="80"
            fill="none" stroke="rgba(167,139,250,0.18)" strokeWidth="1"
            strokeDasharray="6 6"
            className="spin-ring-1"
          />
          <circle
            cx="90" cy="90" r="64"
            fill="none" stroke="rgba(167,139,250,0.12)" strokeWidth="1"
            strokeDasharray="4 8"
            className="spin-ring-2"
          />
        </svg>

        {/* Shield SVG */}
        <svg
          viewBox="0 0 100 110"
          fill="none"
          className="relative h-[110px] w-[100px]"
          aria-hidden
        >
          {/* Shield fill */}
          <path
            d="M50 8 L90 22 L90 55 C90 75 72 92 50 102 C28 92 10 75 10 55 L10 22 Z"
            fill="url(#shieldGrad)"
          />
          {/* Shield stroke that draws itself */}
          <path
            d="M50 8 L90 22 L90 55 C90 75 72 92 50 102 C28 92 10 75 10 55 L10 22 Z"
            fill="none"
            stroke="rgba(167,139,250,0.9)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className="draw-shield"
          />
          {/* Lock shackle */}
          <path
            d="M40 48 C40 42 44 37 50 37 C56 37 60 42 60 48"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            className="drop-lock"
          />
          {/* Lock body */}
          <rect
            x="36" y="48" width="28" height="22" rx="5"
            fill="white"
            className="drop-lock"
          />
          {/* Tick inside lock */}
          <path
            d="M44 59 L48 63 L57 54"
            stroke="#712CDC"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            className="draw-tick"
          />
          <defs>
            <linearGradient id="shieldGrad" x1="10" y1="8" x2="90" y2="102" gradientUnits="userSpaceOnUse">
              <stop stopColor="#5b21b6" />
              <stop offset="1" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ── Text block ──────────────────────────────────────────── */}
      <h3 className="success-text mt-5 text-[22px] font-extrabold tracking-[-0.015em] text-white">
        Locked in.
      </h3>
      <p className="success-sub mt-2 max-w-[28ch] text-[13px] leading-relaxed text-purple-200">
        {plan.isNoCost ? '0% interest · ' : `${plan.interestRate}% p.a. · `}
        {plan.tenureMonths} months · {formatINR(plan.monthlyAmount)}/mo
      </p>
      <p className="success-sub max-w-[30ch] text-[12px] leading-relaxed text-purple-300/70"
        style={{ animationDelay: '1.0s' }}>
        Your mutual-fund backed EMI plan is secured.
      </p>

      {/* ── Done button ─────────────────────────────────────────── */}
      <button
        type="button"
        onClick={onClose}
        className="success-btn mt-8 w-full rounded-2xl border border-purple-400/40 bg-white/10 py-4 text-[15px] font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20 active:scale-[0.98]"
      >
        Done
      </button>
    </div>
  );
}

// ── Review screen (unchanged) ──────────────────────────────────────────────

function ReviewScreen({
  plan, product, variant, hasCashback, onConfirm,
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
          : <Row label="Interest" value={formatINR(plan.interestPaid)} />}
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
