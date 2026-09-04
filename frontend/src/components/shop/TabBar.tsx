'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export type ShopTab = 'brands' | 'nearby' | 'marketplace';

const TABS: { id: ShopTab; label: string }[] = [
  { id: 'brands', label: 'Top Brands' },
  { id: 'nearby', label: 'Nearby Stores' },
  { id: 'marketplace', label: '1Fi Marketplace' },
];

export function TabBar({
  active,
  onChange,
}: {
  active: ShopTab;
  onChange: (tab: ShopTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Shop sections"
      className="flex gap-1.5 rounded-full border border-brand-100 bg-brand-50 p-1.5 shadow-[0_1px_3px_rgba(113,44,220,0.06)]"
    >
      {TABS.map(({ id, label }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={cn(
              'relative flex-1 rounded-full py-[11px] text-center text-[12px] font-semibold tracking-[-0.005em] transition-colors',
              isActive ? 'text-brand' : 'text-ink-muted hover:text-ink-soft',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="shopTabPill"
                className="absolute inset-0 rounded-full bg-white shadow-tab"
                transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
