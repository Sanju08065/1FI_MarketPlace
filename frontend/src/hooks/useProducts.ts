'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listProducts } from '@/lib/api';
import { ProductTrie } from '@/lib/trie';
import type { ProductSummary } from '@/schemas/product';

/**
 * Marketplace product hook — two-layer strategy:
 *
 * Layer 1 — Network (once per session):
 *   Fetch the full catalogue once on mount with no search param.
 *   Cached by TanStack Query for 5 minutes (staleTime in providers.tsx).
 *   This is the ONLY network request for browsing.
 *
 * Layer 2 — Trie (every keystroke, zero network):
 *   Build a ProductTrie from the fetched catalogue.
 *   Every search query is answered by the Trie in O(m) time where
 *   m = query length, completely independent of catalogue size.
 *
 * Fallback:
 *   If the Trie returns 0 results for a non-empty query, fall back to the
 *   server search — catches products added after the initial fetch.
 */
export function useProducts(search: string) {
  // Step 1 — fetch the full catalogue once.
  const catalogueQuery = useQuery({
    queryKey: ['products', 'catalogue'],
    queryFn: () => listProducts({ limit: 50 }),
  });

  // Stable array ref — empty array only when catalogue hasn't loaded yet.
  const catalogue = useMemo(
    () => catalogueQuery.data?.data ?? [],
    [catalogueQuery.data],
  );

  // Build Trie from the catalogue (memoised until catalogue length changes).
  const trie = useMemo(
    () => ProductTrie.fromProducts(catalogue),
    // Rebuild only when the number of products changes — avoids rebuild on
    // every render while keeping the Trie current when new products are added.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [catalogue.length],
  );

  // Local Trie search, O(m). No network.
  const localResults: ProductSummary[] = useMemo(() => {
    if (!search.trim()) return catalogue;
    return trie.search(search);
  }, [search, trie, catalogue]);

  // Step 4 — if Trie returns nothing for a real query, try the server.
  const needsFallback = search.trim().length > 0 && localResults.length === 0;

  const fallbackQuery = useQuery({
    queryKey: ['products', 'search', search],
    queryFn: () => listProducts({ search, limit: 20 }),
    enabled: needsFallback,
  });

  // Resolve final result set.
  const data = needsFallback
    ? fallbackQuery.data
    : {
        data: localResults,
        meta: {
          total: localResults.length,
          page: 1,
          limit: localResults.length,
          totalPages: 1,
        },
      };

  return {
    data,
    isLoading: catalogueQuery.isLoading || (needsFallback && fallbackQuery.isLoading),
    isError: catalogueQuery.isError || (needsFallback && fallbackQuery.isError),
    error: catalogueQuery.error ?? fallbackQuery.error,
    refetch: catalogueQuery.refetch,
  };
}
