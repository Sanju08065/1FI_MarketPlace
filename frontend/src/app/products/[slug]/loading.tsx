import { AppShell } from '@/components/layout/AppShell';
import { Skeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <AppShell className="bg-white">
      <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-1.5 h-3 w-24" />
        </div>
      </div>

      <div className="flex flex-col gap-5 px-4 pt-4">
        <Skeleton className="aspect-[4/3] w-full rounded-3xl" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-16 rounded-2xl" />
          ))}
        </div>
        <div>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="mt-2 h-6 w-3/4" />
          <Skeleton className="mt-3 h-7 w-40" />
        </div>
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </AppShell>
  );
}
