import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 bg-app px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand">
        404
      </div>
      <h1 className="text-xl font-bold text-ink">Page not found</h1>
      <p className="max-w-[30ch] text-[14px] text-ink-muted">
        The product or page you were looking for doesn&apos;t exist.
      </p>
      <Link
        href="/shop"
        className="mt-2 rounded-2xl bg-brand px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-brand-600"
      >
        Back to Shop
      </Link>
    </main>
  );
}
