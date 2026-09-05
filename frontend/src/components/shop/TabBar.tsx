'use client';

import { cn } from '@/lib/cn';

export type ShopTab = 'brands' | 'nearby' | 'marketplace';

const TABS: { id: ShopTab; label: string }[] = [
  { id: 'brands',      label: 'Top Brands'     },
  { id: 'nearby',      label: 'Nearby Stores'  },
  { id: 'marketplace', label: '1Fi Marketplace' },
];

export function TabBar({ active, onChange }: { active: ShopTab; onChange: (tab: ShopTab) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Shop sections"
      className="flex rounded-full bg-[#f2eeff] p-1 shadow-[0_1px_6px_rgba(113,44,220,0.10)]"
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
              'relative flex flex-1 flex-col items-center justify-center gap-0 rounded-full py-[11px] text-[12px] font-semibold tracking-[-0.005em] transition-colors duration-150',
              isActive
                ? 'bg-white text-[#712CDC] shadow-[0_1px_5px_rgba(20,14,50,0.12)]'
                : 'text-zinc-500 hover:text-zinc-700',
            )}
          >
            {label}
            {/* Short underline bar below the label text — only on active */}
            <span
              className={cn(
                'mt-[3px] h-[2.5px] w-[22px] rounded-full bg-[#712CDC] transition-opacity duration-150',
                isActive ? 'opacity-100' : 'opacity-0',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
