'use client';

import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ProductError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-app px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600">
        <TriangleAlert className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-bold text-ink">Something went wrong</h1>
      <p className="max-w-[32ch] text-[14px] text-ink-muted">
        We couldn&apos;t load this product. Please check the API server and try again.
      </p>
      <div className="mt-2 flex gap-3">
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-4 text-[14px] font-bold text-white transition-colors hover:bg-brand-600"
        >
          Back to Shop
        </Link>
      </div>
    </main>
  );
}
