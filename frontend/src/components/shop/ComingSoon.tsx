import type { ReactNode } from 'react';

/** Intentional placeholder for the Top Brands / Nearby Stores tabs. */
export function ComingSoon({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-3xl border border-dashed border-brand-200 bg-white/60 px-6 py-14 text-center animate-fade-in">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand">
        {icon}
      </div>
      <h3 className="text-[17px] font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-[32ch] text-[13.5px] leading-relaxed text-ink-muted">
        {description}
      </p>
      <span className="mt-4 rounded-full bg-brand-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand">
        Coming soon
      </span>
    </div>
  );
}
