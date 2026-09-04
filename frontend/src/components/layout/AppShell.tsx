import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** The mobile app frame — a centered max-width column, pure white background. */
export function AppShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main
      className={cn(
        'relative mx-auto flex min-h-svh w-full max-w-[480px] flex-col bg-white sm:border-x sm:border-zinc-200/70 sm:shadow-[0_0_80px_rgba(20,14,50,0.08)]',
        className,
      )}
    >
      {children}
    </main>
  );
}
