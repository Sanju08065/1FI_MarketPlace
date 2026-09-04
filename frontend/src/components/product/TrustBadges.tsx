import { RefreshCw, ShieldCheck, Zap } from 'lucide-react';

const ITEMS = [
  { Icon: Zap, label: 'Instant approval' },
  { Icon: ShieldCheck, label: 'No CIBIL check' },
  { Icon: RefreshCw, label: 'Flexible repayment' },
] as const;

export function TrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {ITEMS.map(({ Icon, label }) => (
        <div
          key={label}
          className="flex flex-col items-center gap-1.5 rounded-2xl border border-zinc-100 bg-white py-3 text-center shadow-card"
        >
          <Icon className="h-5 w-5 text-brand" strokeWidth={2} />
          <span className="text-[10.5px] font-semibold leading-tight text-ink-soft">{label}</span>
        </div>
      ))}
    </div>
  );
}
