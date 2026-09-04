import { cn } from '@/lib/cn';

export function Swatch({
  hex,
  selected = false,
  size = 16,
  title,
  className,
}: {
  hex: string;
  selected?: boolean;
  size?: number;
  title?: string;
  className?: string;
}) {
  return (
    <span
      title={title}
      aria-hidden="true"
      className={cn('inline-block shrink-0 rounded-full border border-black/10', className)}
      style={{
        backgroundColor: hex,
        width: size,
        height: size,
        boxShadow: selected ? '0 0 0 2px #fff, 0 0 0 3.5px #712CDC' : undefined,
      }}
    />
  );
}
