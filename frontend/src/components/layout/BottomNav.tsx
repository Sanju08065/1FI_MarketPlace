'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Home, PiggyBank, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/cn';

const ITEMS = [
  { title: 'Home', href: '/dashboard', Icon: Home },
  { title: 'Shop', href: '/shop', Icon: ShoppingBag },
  { title: 'EMI Dues', href: '/emi-dues', Icon: CreditCard },
  { title: 'Limit', href: '/pledged-funds', Icon: PiggyBank },
  { title: 'Profile', href: '/profile', Icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
      <div className="safe-bottom flex w-full max-w-[480px] items-center justify-around border-t border-zinc-100 bg-white/90 px-2 backdrop-blur-md sm:border-x sm:border-zinc-200/70">
        {ITEMS.map(({ title, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2.5 text-[10px] font-semibold tracking-[0.01em] transition-colors',
                active ? 'text-brand' : 'text-zinc-400 hover:text-ink-soft',
              )}
            >
              <Icon className={cn('h-[22px] w-[22px]', active ? 'stroke-[2.3]' : 'stroke-[1.8]')} />
              {title}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
