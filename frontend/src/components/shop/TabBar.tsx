'use client';

import { type KeyboardEvent } from 'react';
import { cn } from '@/lib/cn';

export type ShopTab = 'brands' | 'nearby' | 'marketplace';

const TABS: { id: ShopTab; label: string }[] = [
  { id: 'brands',      label: 'Top Brands'     },
  { id: 'nearby',      label: 'Nearby Stores'  },
  { id: 'marketplace', label: '1Fi Marketplace' },
];

export function TabBar({ active, onChange }: { active: ShopTab; onChange: (tab: ShopTab) => void }) {
  // Arrow-key / Home / End navigation between tabs (WAI-ARIA tabs pattern).
  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (e.key === 'ArrowRight') next = (index + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (index - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    else return;
    e.preventDefault();
    onChange(TABS[next].id);
    const tabs = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[next]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label="Shop sections"
      className="flex rounded-full bg-brand-pale p-1 shadow-[0_1px_6px_rgba(113,44,220,0.10)]"
    >
      {TABS.map(({ id, label }, index) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            id={`tab-${id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${id}`}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-0 rounded-full py-[11px] text-[12px] font-semibold tracking-[-0.005em] transition-colors duration-150',
              isActive
                ? 'bg-white text-brand shadow-[0_1px_5px_rgba(20,14,50,0.12)]'
                : 'text-zinc-500 hover:text-zinc-700',
            )}
          >
            {label}
            {/* Short underline bar below the label text — only on active */}
            <span
              className={cn(
                'mt-[3px] h-[2.5px] w-[22px] rounded-full bg-brand transition-opacity duration-150',
                isActive ? 'opacity-100' : 'opacity-0',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
