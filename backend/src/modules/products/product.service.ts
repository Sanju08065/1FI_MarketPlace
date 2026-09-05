import type { Prisma } from '@prisma/client';
import { buildMeta, type PageMeta } from '../../lib/http';
import { computeEmi } from '../emi/emi.service';
import {
  findManyProducts,
  findProductBySlug,
  type ProductWithRelations,
} from './product.repository';
import type { ListQuery } from './product.schema';

// ── DTOs (the exact shape the API returns) ────────────────────────────────────

export interface VariantDto {
  id: string;
  label: string;
  storage: string | null;
  color: string | null;
  hexColor: string | null;
  finish: string | null;
  price: number;
  stock: number;
  inStock: boolean;
  imageUrl: string | null;
}

export interface EmiPlanDto {
  id: string;
  tenureMonths: number;
  interestRate: number;
  isNoCost: boolean;
  monthlyAmount: number;
  totalPayable: number;
  interestPaid: number;
  cashbackAmount: number;
  cashbackLabel: string | null;
  effectiveCost: number;
  isRecommended: boolean;
}

export interface ProductSummaryDto {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  description: string | null;
  imageUrl: string | null;
  mrp: number;
  minPrice: number;
  maxPrice: number;
  discountPercent: number;
  variantCount: number;
  lowestMonthly: number | null;
  variants: VariantDto[];
  emiPlans: EmiPlanDto[];
}

export interface ProductDetailDto extends ProductSummaryDto {
  isActive: boolean;
  createdAt: string;
}

export interface ProductEmiDto {
  productId: string;
  slug: string;
  variantId: string | null;
  principal: number;
  plans: EmiPlanDto[];
}

// ── Mappers ───────────────────────────────────────────────────────────────────

const toNum = (d: Prisma.Decimal | number): number => Number(d);
const imageUrl = (id: string | null): string | null => (id ? `/api/v1/images/${id}` : null);

function mapVariant(v: ProductWithRelations['variants'][number]): VariantDto {
  return {
    id: v.id,
    label: v.label,
    storage: v.storage,
    color: v.color,
    hexColor: v.hexColor,
    finish: v.finish,
    price: toNum(v.price),
    stock: v.stock,
    inStock: v.stock > 0,
    imageUrl: imageUrl(v.imageId),
  };
}

function mapPlan(principal: number, p: ProductWithRelations['emiPlans'][number]): EmiPlanDto {
  const interestRate = toNum(p.interestRate);
  const cashbackAmount = toNum(p.cashbackAmount);
  const emi = computeEmi(principal, p.tenureMonths, interestRate, cashbackAmount);
  return {
    id: p.id,
    tenureMonths: p.tenureMonths,
    interestRate,
    isNoCost: interestRate === 0,
    monthlyAmount: emi.monthlyAmount,
    totalPayable: emi.totalPayable,
    interestPaid: emi.interestPaid,
    cashbackAmount,
    cashbackLabel: p.cashbackLabel,
    effectiveCost: emi.effectiveCost,
    isRecommended: p.isRecommended,
  };
}

function priceStats(variants: VariantDto[], mrp: number): { min: number; max: number } {
  if (variants.length === 0) return { min: mrp, max: mrp };
  // Single-pass reduce — avoids spreading the array onto the call stack
  // and iterating twice (once for min, once for max).
  return variants.reduce(
    (acc, v) => ({ min: Math.min(acc.min, v.price), max: Math.max(acc.max, v.price) }),
    { min: Infinity, max: -Infinity },
  );
}

function mapProduct(p: ProductWithRelations): ProductSummaryDto {
  const mrp = toNum(p.mrp);
  const variants = p.variants.map(mapVariant);
  const { min: minPrice, max: maxPrice } = priceStats(variants, mrp);
  const emiPlans = p.emiPlans.map((pl) => mapPlan(minPrice, pl));
  const lowestMonthly = emiPlans.length
    ? emiPlans.reduce((min, e) => Math.min(min, e.monthlyAmount), Infinity)
    : null;

  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    category: p.category,
    description: p.description,
    imageUrl: imageUrl(p.imageId),
    mrp,
    minPrice,
    maxPrice,
    discountPercent: mrp > minPrice ? Math.round(((mrp - minPrice) / mrp) * 100) : 0,
    variantCount: variants.length,
    lowestMonthly,
    variants,
    emiPlans,
  };
}

// ── Use cases ───────────────────────────────────────────────────────────────

export async function listProducts(
  q: ListQuery,
): Promise<{ data: ProductSummaryDto[]; meta: PageMeta }> {
  const { items, total } = await findManyProducts(q);
  let data = items.map(mapProduct);

  if (q.sort === 'price_asc') data = [...data].sort((a, b) => a.minPrice - b.minPrice);
  else if (q.sort === 'price_desc') data = [...data].sort((a, b) => b.minPrice - a.minPrice);

  return { data, meta: buildMeta(total, q.page, q.limit) };
}

export async function getProductBySlug(slug: string): Promise<ProductDetailDto | null> {
  const p = await findProductBySlug(slug);
  if (!p) return null;
  return { ...mapProduct(p), isActive: p.isActive, createdAt: p.createdAt.toISOString() };
}

export async function getProductEmi(
  slug: string,
  variantId?: string,
): Promise<ProductEmiDto | null> {
  const p = await findProductBySlug(slug);
  if (!p) return null;

  const chosen = variantId ? p.variants.find((v) => v.id === variantId) : undefined;
  const prices = p.variants.map((v) => Number(v.price));
  const principal = chosen
    ? Number(chosen.price)
    : prices.length
      ? prices.reduce((min, pr) => Math.min(min, pr), Infinity)
      : Number(p.mrp);

  return {
    productId: p.id,
    slug: p.slug,
    variantId: chosen?.id ?? null,
    principal,
    plans: p.emiPlans.map((pl) => mapPlan(principal, pl)),
  };
}
