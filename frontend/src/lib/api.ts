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

/**
 * Inline SVG placeholder shown when an image is missing or fails to load.
 * A data URI means the browser never issues a network request for it (and an
 * empty src, which would re-request the current document, is avoided).
 */
export const IMAGE_PLACEHOLDER =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='180'%3E%3Crect width='100%25' height='100%25' fill='%23f5f0ff'/%3E%3Ctext x='50%25' y='50%25' font-family='system-ui,sans-serif' font-size='20' font-weight='700' fill='%23bfa2fb' text-anchor='middle' dominant-baseline='middle'%3E1Fi%3C/text%3E%3C/svg%3E";

/** Turn a relative API image path into an absolute URL the browser can load. */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return IMAGE_PLACEHOLDER;
  if (/^https?:\/\//i.test(url)) return url;
  return `${API_BASE}${url}`;
}

/**
 * <img onError> handler — swaps a broken image for the placeholder once (the
 * `data:` guard prevents an error loop if the placeholder itself can't load).
 */
export function onImageError(event: { currentTarget: HTMLImageElement }): void {
  const img = event.currentTarget;
  if (!img.src.startsWith('data:')) img.src = IMAGE_PLACEHOLDER;
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
