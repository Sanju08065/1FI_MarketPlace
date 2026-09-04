'use client';

import { useQuery } from '@tanstack/react-query';
import { listProducts } from '@/lib/api';

/** Marketplace product query — cached + debounced search by the caller. */
export function useProducts(search: string) {
  return useQuery({
    queryKey: ['products', search],
    queryFn: () => listProducts({ search: search || undefined, limit: 20 }),
  });
}
