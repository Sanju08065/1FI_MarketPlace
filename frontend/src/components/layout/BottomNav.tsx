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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
      <div className="safe-bottom flex w-full max-w-[480px] items-stretch justify-around rounded-t-[24px] bg-white px-1 pb-1 pt-2 shadow-[0_-6px_24px_rgba(20,14,50,0.12)] sm:border-x sm:border-zinc-200/60">
        {ITEMS.map(({ title, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className="flex flex-col items-center gap-[2px] px-2 py-1 text-[10px] font-semibold tracking-[0.01em]"
            >
              {/* Purple underline is ABOVE the icon (between icon and top of nav) */}
              <span
                className={cn(
                  'mb-[2px] h-[2.5px] w-5 rounded-full bg-brand transition-opacity duration-150',
                  active ? 'opacity-100' : 'opacity-0',
                )}
              />
              <Icon
                className={cn(
                  'h-[23px] w-[23px]',
                  active ? 'text-brand stroke-[2.2]' : 'text-zinc-400 stroke-[1.75]',
                )}
              />
              <span className={cn('mt-[1px]', active ? 'text-brand' : 'text-zinc-400')}>
                {title}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
