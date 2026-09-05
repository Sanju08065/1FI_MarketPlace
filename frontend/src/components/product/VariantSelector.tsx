'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { formatINR } from '@/lib/format';
import { Swatch } from '@/components/ui/Swatch';
import type { Variant } from '@/schemas/product';

export function VariantSelector({
  variants,
  selectedId,
  basePrice,
  onSelect,
}: {
  variants: Variant[];
  selectedId: string;
  basePrice: number;
  onSelect: (variant: Variant) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {variants.map((v) => {
        const active = v.id === selectedId;
        const delta = v.price - basePrice;
        const outOfStock = !v.inStock;

        return (
          <motion.button
            key={v.id}
            type="button"
            disabled={outOfStock}
            onClick={() => onSelect(v)}
            aria-pressed={active}
            aria-label={`${v.label}${outOfStock ? ' — sold out' : ''}`}
            whileTap={{ scale: outOfStock ? 1 : 0.95 }}
            className={cn(
              'relative flex items-center gap-2 rounded-2xl border px-3.5 py-2.5 text-[13px] font-semibold transition-colors duration-200',
              active
                ? 'border-brand bg-brand-50 text-brand shadow-ring'
                : 'border-zinc-200 bg-white text-ink-soft hover:border-zinc-300 hover:bg-zinc-50',
              outOfStock && 'cursor-not-allowed opacity-40',
            )}
          >
            {v.hexColor && <Swatch hex={v.hexColor} selected={active} size={16} />}
            <span>{v.label}</span>
            {delta > 0 && (
              <span
                className={cn('text-[11px] font-medium', active ? 'text-brand-600' : 'text-zinc-400')}
              >
                +{formatINR(delta)}
              </span>
            )}
            {outOfStock && (
              <span className="absolute -right-1.5 -top-1.5 rounded-full bg-zinc-500 px-1.5 py-px text-[8px] font-bold uppercase text-white">
                Sold out
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
