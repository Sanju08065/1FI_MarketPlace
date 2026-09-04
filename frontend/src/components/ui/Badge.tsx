import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'brand' | 'green' | 'amber' | 'neutral' | 'solid';

const TONES: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand',
  green: 'bg-green-50 text-green-700',
  amber: 'bg-amber-50 text-amber-700',
  neutral: 'bg-zinc-100 text-zinc-600',
  solid: 'bg-brand text-white',
};

export function Badge({
  tone = 'brand',
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
