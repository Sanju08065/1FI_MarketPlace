'use client';

import { cn } from '@/lib/cn';

export type ShopTab = 'brands' | 'nearby' | 'marketplace';

const TABS: { id: ShopTab; label: string }[] = [
  { id: 'brands',      label: 'Top Brands'     },
  { id: 'nearby',      label: 'Nearby Stores'  },
  { id: 'marketplace', label: '1Fi Marketplace' },
];

interface TabBarProps {
  active: ShopTab;
  onChange: (tab: ShopTab) => void;
}

/**
 * 3-tab pill bar — matches the 1Fi app design from the screenshot:
 * - Lavender (#f5f0ff) container with soft shadow
 * - Active tab: white rounded pill + purple underline bar below label
 * - Inactive tab: plain text, no background
 */
export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="Shop sections"
      className="flex gap-1 rounded-full bg-[#f0ebff] p-1 shadow-[0_1px_4px_rgba(113,44,220,0.08)]"
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
              'relative flex flex-1 flex-col items-center justify-center rounded-full py-[10px] text-[12.5px] font-semibold tracking-[-0.005em] transition-colors duration-150',
              isActive
                ? 'bg-white text-brand shadow-[0_1px_4px_rgba(20,14,50,0.10)]'
                : 'text-zinc-500 hover:text-ink-soft',
            )}
          >
            <span>{label}</span>
            {/* Purple underline dot — only visible on active */}
            {isActive && (
              <span className="absolute bottom-[5px] left-1/2 h-[2.5px] w-5 -translate-x-1/2 rounded-full bg-brand" />
            )}
          </button>
        );
      })}
    </div>
  );
}
