'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Product catalogue changes rarely — keep results fresh for 5 min
            // so TanStack doesn't background-refetch on every tab focus/mount.
            staleTime: 5 * 60 * 1000,
            // Keep unused cache entries for 10 min so navigating back to the
            // shop doesn't trigger a fresh fetch.
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
