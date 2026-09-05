'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { PackageSearch, ShoppingBag, TriangleAlert } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { SearchBar } from './SearchBar';
import { ProductCard } from './ProductCard';
import { ProductListSkeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export function MarketplaceTab() {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = useProducts(search);
  const reduce = useReducedMotion();

  const products = data?.data ?? [];

  return (
    <div className="flex flex-col gap-3">
      <SearchBar value={search} onChange={setSearch} placeholder="Search products, brands…" />

      <div className="flex items-baseline justify-between">
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-ink">1Fi Marketplace</h2>
        {data?.meta && !isLoading && (
          <span className="text-[12px] text-ink-muted">{data.meta.total} products</span>
        )}
      </div>

      {isLoading ? (
        <ProductListSkeleton count={3} />
      ) : isError ? (
        <div className="flex flex-col items-center rounded-3xl border border-red-100 bg-red-50/60 px-6 py-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
            <TriangleAlert className="h-6 w-6" />
          </div>
          <h3 className="text-[16px] font-bold text-ink">Couldn&apos;t load products</h3>
          <p className="mt-1 max-w-[32ch] text-[13px] text-ink-muted">
            {(error as Error)?.message ?? 'Something went wrong.'}
          </p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-zinc-100 bg-white px-6 py-12 text-center shadow-card">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand">
            {search ? <PackageSearch className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />}
          </div>
          <h3 className="text-[16px] font-bold text-ink">No products found</h3>
          <p className="mt-1 max-w-[32ch] text-[13px] text-ink-muted">
            {search ? 'Try a different search term.' : 'Products are on their way.'}
          </p>
        </div>
      ) : (
        <motion.div
          className="flex flex-col gap-3"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.06 } } }}
        >
          {products.map((p) => (
            <motion.div
              key={p.id}
              variants={{
                hidden: { opacity: 0, y: reduce ? 0 : 12 },
                show: { opacity: 1, y: 0 },
              }}
            >
              <ProductCard product={p} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
