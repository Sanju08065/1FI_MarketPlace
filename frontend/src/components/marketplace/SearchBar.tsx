'use client';

import { Search, X } from 'lucide-react';

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search…',
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex h-[46px] items-center gap-2.5 rounded-full border-2 border-zinc-200 bg-white px-4 shadow-card transition-colors focus-within:border-brand">
      <Search className="h-[17px] w-[17px] shrink-0 text-zinc-400" strokeWidth={2} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="flex-1 bg-transparent text-[13.5px] text-ink outline-none focus:outline-none focus-visible:outline-none placeholder:text-zinc-400"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="shrink-0 text-zinc-400 transition-colors hover:text-ink-soft"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
