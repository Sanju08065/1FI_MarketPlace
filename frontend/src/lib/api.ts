import {
  detailResponseSchema,
  listResponseSchema,
  type PageMeta,
  type ProductDetail,
  type ProductSummary,
} from '@/schemas/product';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const API_V1 = `${API_BASE}/api/v1`;

async function apiGet(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(`${API_V1}${path}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });
  const json = (await res.json().catch(() => null)) as { error?: string } | null;
  if (!res.ok) {
    throw new Error(json?.error ?? `Request failed (${res.status})`);
  }
  return json;
}

/** Turn a relative API image path into an absolute URL the browser can load. */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url}`;
}

export interface ListParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'price_asc' | 'price_desc';
}

export async function listProducts(
  params: ListParams = {},
): Promise<{ data: ProductSummary[]; meta: PageMeta }> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.category) qs.set('category', params.category);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.sort) qs.set('sort', params.sort);

  const query = qs.toString() ? `?${qs.toString()}` : '';
  const json = await apiGet(`/products${query}`);
  const parsed = listResponseSchema.parse(json);
  return { data: parsed.data, meta: parsed.meta };
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  // no-store keeps the detail page dynamic + always fresh (and avoids
  // build-time API calls during `next build`).
  const json = await apiGet(`/products/${slug}`, { cache: 'no-store' });
  const parsed = detailResponseSchema.parse(json);
  return parsed.data;
}
