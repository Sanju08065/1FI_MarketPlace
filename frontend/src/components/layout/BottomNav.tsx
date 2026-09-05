'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CreditCard, Home, PiggyBank, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/cn';

const ITEMS = [
  { title: 'Home',     href: '/dashboard',    Icon: Home },
  { title: 'Shop',     href: '/shop',         Icon: ShoppingBag },
  { title: 'EMI Dues', href: '/emi-dues',     Icon: CreditCard },
  { title: 'Limit',    href: '/pledged-funds', Icon: PiggyBank },
  { title: 'Profile',  href: '/profile',      Icon: User },
] as const;

/**
 * Bottom navigation — matches the 1Fi app design from the screenshot:
 * - White floating card with rounded top corners and a subtle shadow
 * - Active tab: purple icon + label + small purple underline bar below label
 * - Inactive tab: grey icon + label, no indicator
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
      <div
        className="safe-bottom flex w-full max-w-[480px] items-end justify-around rounded-t-[22px] bg-white px-2 pb-1 pt-1 shadow-[0_-4px_20px_rgba(20,14,50,0.09)] sm:border-x sm:border-zinc-200/60"
      >
        {ITEMS.map(({ title, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className="flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] font-semibold tracking-[0.01em] transition-colors"
            >
              <Icon
                className={cn(
                  'h-[22px] w-[22px] transition-colors',
                  active ? 'text-brand stroke-[2.3]' : 'text-zinc-400 stroke-[1.8]',
                )}
              />
              <span className={cn('transition-colors', active ? 'text-brand' : 'text-zinc-400')}>
                {title}
              </span>
              {/* Purple underline indicator — mirrors the 1Fi app screenshot */}
              <span
                className={cn(
                  'mt-0.5 h-[2.5px] w-5 rounded-full bg-brand transition-opacity duration-150',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
