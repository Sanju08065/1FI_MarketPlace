'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

/** Accessible bottom sheet with spring slide-up + backdrop. */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[60] bg-ink/40 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-h-[85svh] w-full max-w-[480px] overflow-hidden rounded-t-3xl bg-white shadow-sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 34, stiffness: 360 }}
          >
            <div className="flex flex-col">
              <div className="flex items-center justify-center pt-3">
                <span className="h-1.5 w-10 rounded-full bg-zinc-200" />
              </div>
              {title && (
                <div className="flex items-center justify-between px-5 pb-2 pt-3">
                  <h2 className="text-[16px] font-bold text-ink">{title}</h2>
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-ink-soft transition-colors hover:bg-zinc-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="safe-bottom overflow-y-auto px-5 pb-5">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
