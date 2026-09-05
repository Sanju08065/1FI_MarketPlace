'use client';

import { useMemo, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { resolveImageUrl } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { Variant } from '@/schemas/product';

const ZOOM = 2.4;

export function Gallery({
  variants,
  selectedId,
  productName,
  discountPercent,
}: {
  variants: Variant[];
  selectedId: string;
  productName: string;
  discountPercent: number;
}) {
  // Map<id, Variant> — O(1) lookup instead of O(n) Array.find on every
  // pointer-move event (runs at 60fps during zoom/pan).
  const variantMap = useMemo(
    () => new Map(variants.map((v) => [v.id, v])),
    [variants],
  );
  const selected = variantMap.get(selectedId) ?? variants[0];
  const image = resolveImageUrl(selected?.imageUrl);

  const [active, setActive] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');

  const clamp = (n: number) => Math.min(100, Math.max(0, n));
  const moveOrigin = (clientX: number, clientY: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setOrigin(
      `${clamp(((clientX - r.left) / r.width) * 100)}% ${clamp(((clientY - r.top) / r.height) * 100)}%`,
    );
  };
  const reset = () => {
    setActive(false);
    setOrigin('50% 50%');
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div
        className={cn(
          'relative aspect-[4/3] w-full touch-none select-none overflow-hidden rounded-3xl border border-zinc-100 bg-gradient-to-br from-zinc-50 to-brand-50/40 [-webkit-touch-callout:none]',
          active ? 'cursor-zoom-out' : 'cursor-zoom-in',
        )}
        onContextMenu={(e) => e.preventDefault()}
        // Mouse: hover to zoom, move to pan, leave to reset
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') setActive(true);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') reset();
        }}
        // Touch / pen: press to zoom, drag to pan, release to reset
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') {
            e.currentTarget.setPointerCapture(e.pointerId);
            setActive(true);
            moveOrigin(e.clientX, e.clientY, e.currentTarget);
          }
        }}
        onPointerMove={(e) => {
          if (active) moveOrigin(e.clientX, e.clientY, e.currentTarget);
        }}
        onPointerUp={(e) => {
          if (e.pointerType !== 'mouse') reset();
        }}
        onPointerCancel={(e) => {
          if (e.pointerType !== 'mouse') reset();
        }}
      >
        {/* Soft glow that picks up the selected variant's colour */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[46%] h-[76%] w-[76%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-35 blur-3xl transition-colors duration-500"
          style={{ backgroundColor: selected?.hexColor ?? '#712CDC' }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={image}
          src={image}
          alt={`${productName} — ${selected?.color ?? ''}`}
          draggable={false}
          // fetchPriority="high" + eager loading eliminates the slow bar —
          // browser fetches this image immediately as a high-priority resource.
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full animate-fade-in object-contain p-7 transition-transform duration-200 ease-out"
          style={{
            transform: `scale(${active ? ZOOM : 1})`,
            transformOrigin: origin,
            // Promote to GPU layer only while actively zooming/panning.
            // A permanent will-change forces the browser to composite this
            // element every frame even when nothing is moving.
            willChange: active ? 'transform' : 'auto',
          }}
        />

        {discountPercent > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-green-500 px-2.5 py-1 text-[11px] font-bold text-white shadow">
            {discountPercent}% OFF
          </span>
        )}

        {/* Zoom hint (hidden while zoomed) */}
        <span
          className={cn(
            'pointer-events-none absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/85 px-2 py-1 text-[10px] font-semibold text-ink-soft shadow-sm backdrop-blur transition-opacity duration-200',
            active ? 'opacity-0' : 'opacity-100',
          )}
        >
          <ZoomIn className="h-3 w-3" />
          Hold &amp; drag to zoom
        </span>

        {selected?.hexColor && (
          <span
            className="absolute bottom-3 right-3 h-7 w-7 rounded-full border-2 border-white shadow-lg ring-1 ring-black/10 transition-colors duration-500"
            style={{ backgroundColor: selected.hexColor }}
            title={selected.color ?? ''}
          />
        )}
      </div>
    </div>
  );
}
