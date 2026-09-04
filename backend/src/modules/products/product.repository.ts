import { Prisma } from '@prisma/client';
import { prisma } from '../../db/prisma';
import type { ListQuery } from './product.schema';

/** Relations loaded with every product read. Image bytes are never fetched here. */
export const productInclude = {
  variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
  emiPlans: { where: { isActive: true }, orderBy: { tenureMonths: 'asc' } },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

function buildWhere(q: ListQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (q.category) where.category = q.category.toLowerCase();
  if (q.search) {
    where.OR = [
      { name: { contains: q.search, mode: 'insensitive' } },
      { brand: { contains: q.search, mode: 'insensitive' } },
    ];
  }
  return where;
}

export async function findManyProducts(
  q: ListQuery,
): Promise<{ items: ProductWithRelations[]; total: number }> {
  const where = buildWhere(q);
  const [items, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { createdAt: 'desc' },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total };
}

export function findProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  return prisma.product.findFirst({ where: { slug, isActive: true }, include: productInclude });
}
