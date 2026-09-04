'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/cn';

/**
 * Rolls the value vertically when it changes (e.g. price updates on variant
 * or EMI-plan change). Uses popLayout so the outgoing value doesn't push the
 * surrounding text during the transition.
 */
export function AnimatedAmount({
  value,
  className,
}: {
  value: string | number;
  className?: string;
}) {
  const text = String(value);
  return (
    <span className={cn('relative inline-flex overflow-hidden', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          initial={{ y: '60%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '-60%', opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
