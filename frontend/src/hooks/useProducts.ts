'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listProducts } from '@/lib/api';
import { ProductTrie } from '@/lib/trie';
import type { PageMeta, ProductSummary } from '@/schemas/product';
import { useDebounce } from './useDebounce';

/**
 * Marketplace product hook — two-layer strategy:
 *
 * Layer 1 — Network (once per session):
 *   Fetch the catalogue once on mount (no search param), cached by TanStack
 *   Query. This is the only request needed for browsing.
 *
 * Layer 2 — In-memory search (every keystroke, zero network, no debounce):
 *   A prefix Trie answers queries in O(m). If the prefix Trie misses (e.g. an
 *   infix like "phone" inside "iPhone") we fall back to a substring scan over
 *   the (small) catalogue so local search stays correct, still with no network.
 *
 * Layer 3 — Server fallback (debounced):
 *   Only when local search finds nothing for a real query do we hit the server
 *   — this catches products added after the initial fetch. This is the ONLY
 *   place a debounce is useful, so the local layers stay instant.
 */
export function useProducts(search: string) {
  const catalogueQuery = useQuery({
    queryKey: ['products', 'catalogue'],
    queryFn: () => listProducts({ limit: 50 }),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  // Stable array ref — empty only until the catalogue loads.
  const catalogue = useMemo(() => catalogueQuery.data?.data ?? [], [catalogueQuery.data]);

  // Rebuild the Trie only when the catalogue data changes.
  const trie = useMemo(() => ProductTrie.fromProducts(catalogue), [catalogue]);

  // Instant local search on the raw query (no debounce).
  const query = search.trim();
  const localResults: ProductSummary[] = useMemo(() => {
    if (!query) return catalogue;
    const prefixHits = trie.search(query);
    if (prefixHits.length > 0) return prefixHits;
    // Infix fallback for the small in-memory catalogue (e.g. "phone" → iPhone).
    const q = query.toLowerCase();
    return catalogue.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(q));
  }, [query, trie, catalogue]);

  // Only the server fallback is debounced.
  const debouncedQuery = useDebounce(query, 300);
  const needsFallback = query.length > 0 && localResults.length === 0;

  const fallbackQuery = useQuery({
    queryKey: ['products', 'search', debouncedQuery],
    queryFn: () => listProducts({ search: debouncedQuery, limit: 20 }),
    enabled: needsFallback && debouncedQuery.length > 0,
  });

  const data = useMemo((): { data: ProductSummary[]; meta: PageMeta } | undefined => {
    if (needsFallback) return fallbackQuery.data;
    const isSearching = query.length > 0;
    // Browsing shows the true catalogue total from the server; a local search
    // reports the number of matches it actually found.
    const meta: PageMeta = isSearching
      ? { total: localResults.length, page: 1, limit: localResults.length, totalPages: 1 }
      : (catalogueQuery.data?.meta ?? {
          total: localResults.length,
          page: 1,
          limit: localResults.length,
          totalPages: 1,
        });
    return { data: localResults, meta };
  }, [needsFallback, fallbackQuery.data, query, localResults, catalogueQuery.data]);

  return {
    data,
    isLoading: catalogueQuery.isLoading || (needsFallback && fallbackQuery.isLoading),
    isError: catalogueQuery.isError || (needsFallback && fallbackQuery.isError),
    error: catalogueQuery.error ?? fallbackQuery.error,
    refetch: catalogueQuery.refetch,
  };
}
