'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand text-white shadow-cta hover:bg-brand-600 active:scale-[0.98]',
  secondary: 'bg-brand-50 text-brand hover:bg-brand-100 active:scale-[0.98]',
  ghost: 'border border-zinc-200 bg-white text-ink-soft hover:bg-zinc-50',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 rounded-xl px-3 text-[13px]',
  md: 'h-11 rounded-2xl px-4 text-[14px]',
  lg: 'h-[52px] rounded-2xl px-6 text-[15px]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
