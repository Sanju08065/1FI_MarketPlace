import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import type { ListQuery } from './product.schema';

/** Relations loaded with every product read. Image bytes are never fetched here. */
export const productInclude = {
  variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
  emiPlans: { where: { isActive: true }, orderBy: { tenureMonths: 'asc' } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

/** Load full relations for a set of ids, preserving the supplied id order. */
async function fetchByIdsInOrder(ids: string[]): Promise<ProductWithRelations[]> {
  if (ids.length === 0) return [];
  const items = await prisma.product.findMany({
    where: { id: { in: ids } },
    include: productInclude,
  });
  const rank = new Map(ids.map((id, i) => [id, i]));
  return items.sort((a, b) => (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0));
}

/**
 * List products with filtering, full-text search, sorting and pagination — all
 * performed in the database so results are correct across every page (not just
 * the current one).
 *
 * A single window-function query selects the ordered, paginated ids plus the
 * total match count; full relations are then loaded for just that page. This
 * keeps sorting authoritative in SQL instead of re-ordering an already-sliced
 * page in memory. Ordering:
 *   - price_asc / price_desc → the product's lowest active-variant price
 *   - search present (no explicit price sort) → ts_rank relevance via the GIN index
 *   - otherwise → newest first
 *
 * search_vector is a STORED generated tsvector maintained by Postgres, and
 * plainto_tsquery converts free text to a tsquery safely (no injection risk).
 */
export async function findManyProducts(
  q: ListQuery,
): Promise<{ items: ProductWithRelations[]; total: number }> {
  const skip = (q.page - 1) * q.limit;

  const conditions: Prisma.Sql[] = [Prisma.sql`p.is_active = TRUE`];
  if (q.category) conditions.push(Prisma.sql`p.category = ${q.category.toLowerCase()}`);
  if (q.search) {
    conditions.push(Prisma.sql`p.search_vector @@ plainto_tsquery('english', ${q.search})`);
  }
  const whereSql = Prisma.join(conditions, ' AND ');

  // Lowest active-variant price, falling back to MRP when a product has none.
  const priceExpr = Prisma.sql`COALESCE(MIN(v.price), p.mrp)`;

  let orderSql: Prisma.Sql;
  if (q.sort === 'price_asc') {
    orderSql = Prisma.sql`${priceExpr} ASC, p.created_at DESC`;
  } else if (q.sort === 'price_desc') {
    orderSql = Prisma.sql`${priceExpr} DESC, p.created_at DESC`;
  } else if (q.search) {
    orderSql = Prisma.sql`MAX(ts_rank(p.search_vector, plainto_tsquery('english', ${q.search}))) DESC, p.created_at DESC`;
  } else {
    orderSql = Prisma.sql`p.created_at DESC`;
  }

  // COUNT(*) OVER () runs after GROUP BY, so it yields the number of matching
  // products (groups) — the true total for pagination.
  const rows = await prisma.$queryRaw<{ id: string; total: bigint }[]>`
    SELECT p.id, COUNT(*) OVER () AS total
    FROM   products p
    LEFT   JOIN product_variants v ON v.product_id = p.id AND v.is_active = TRUE
    WHERE  ${whereSql}
    GROUP  BY p.id
    ORDER  BY ${orderSql}
    LIMIT  ${q.limit} OFFSET ${skip}
  `;

  if (rows.length === 0) return { items: [], total: 0 };

  const total = Number(rows[0]!.total);
  const items = await fetchByIdsInOrder(rows.map((r) => r.id));
  return { items, total };
}

/** Fetch a single active product (with relations) by its slug. */
export function findProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: productInclude,
  });
}
