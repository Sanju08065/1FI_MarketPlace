import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('shimmer rounded-lg', className)} />;
}

/** Matches the marketplace ProductCard footprint. */
export function ProductCardSkeleton() {
  return (
    <div className="flex gap-4 rounded-card border border-zinc-100 bg-white p-3.5 shadow-card">
      <Skeleton className="h-24 w-24 shrink-0 rounded-2xl" />
      <div className="flex min-w-0 flex-1 flex-col gap-2 py-1">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/2" />
        <div className="mt-1 flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="mt-1 flex gap-1.5">
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
          <Skeleton className="h-3.5 w-3.5 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function ProductListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
