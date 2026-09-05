import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import type { ListQuery } from './product.schema';

/** Relations loaded with every product read. Image bytes are never fetched here. */
export const productInclude = {
  variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
  emiPlans: { where: { isActive: true }, orderBy: { tenureMonths: 'asc' } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

/**
 * Fetch products using a GIN full-text search index when a search term is
 * present — O(log n + k) instead of a LIKE '%x%' full table scan O(n).
 *
 * When no search term is given we fall back to a plain Prisma query so the
 * normal filters (category, pagination, ordering) continue to work cleanly.
 *
 * The search_vector column is a STORED generated tsvector maintained by
 * Postgres — no application cost, always up to date.
 */
export async function findManyProducts(
  q: ListQuery,
): Promise<{ items: ProductWithRelations[]; total: number }> {
  const skip = (q.page - 1) * q.limit;

  // ── Fast path: full-text search via GIN index ─────────────────────────────
  if (q.search) {
    // plainto_tsquery converts free text to a tsquery safely (no injection
    // risk, handles punctuation, multi-word phrases with implicit AND).
    const searchResults = await prisma.$queryRaw<{ id: string; total: bigint }[]>`
      SELECT id, COUNT(*) OVER () AS total
      FROM   products
      WHERE  is_active = TRUE
        AND  search_vector @@ plainto_tsquery('english', ${q.search})
        ${q.category ? Prisma.sql`AND category = ${q.category.toLowerCase()}` : Prisma.empty}
      ORDER  BY ts_rank(search_vector, plainto_tsquery('english', ${q.search})) DESC,
                created_at DESC
      LIMIT  ${q.limit} OFFSET ${skip}
    `;

    if (searchResults.length === 0) {
      return { items: [], total: 0 };
    }

    const total = Number(searchResults[0]!.total);
    const ids = searchResults.map((r) => r.id);

    // Fetch full relations for the matched IDs, preserving rank order.
    const items = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: productInclude,
    });

    // Re-sort to match the rank order from the raw query.
    const order = new Map(ids.map((id, i) => [id, i]));
    items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    return { items, total };
  }

  // ── Normal path: no search term ───────────────────────────────────────────
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (q.category) where.category = q.category.toLowerCase();

  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: q.limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total };
}

/**
 * Request-scoped slug cache (Fix 9 — DataLoader pattern).
 * Deduplicates findProductBySlug calls within the same request lifecycle.
 * Key: slug → Promise<result>. Checked and set per call.
 */
const slugCache = new Map<string, Promise<ProductWithRelations | null>>();

export function clearSlugCache(): void {
  slugCache.clear();
}

export function findProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  const cached = slugCache.get(slug);
  if (cached) return cached;

  const promise = prisma.product.findFirst({
    where: { slug, isActive: true },
    include: productInclude,
  });

  slugCache.set(slug, promise);

  // Auto-evict after 500ms — long enough to deduplicate within a single
  // request, short enough to never serve stale data across requests.
  setTimeout(() => slugCache.delete(slug), 500);

  return promise;
}
