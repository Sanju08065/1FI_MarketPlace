import { afterAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { disconnectDb } from '../src/db/prisma';

const app = createApp();

describe('1Fi Marketplace API', () => {
  afterAll(async () => {
    await disconnectDb();
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ok');
  });

  it('GET /api/v1/products returns the seeded catalogue', async () => {
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
    expect(res.body.meta.total).toBeGreaterThanOrEqual(3);
  });

  it('GET /api/v1/products/:slug returns detail with variants and EMI plans', async () => {
    const res = await request(app).get('/api/v1/products/apple-iphone-16-pro');
    expect(res.status).toBe(200);
    expect(res.body.data.variants.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data.emiPlans.length).toBeGreaterThan(0);
  });

  it('computes no-cost EMI as ceil(price / tenure)', async () => {
    const res = await request(app).get('/api/v1/products/apple-iphone-16-pro');
    const noCost = res.body.data.emiPlans.find((p: { isNoCost: boolean }) => p.isNoCost);
    expect(noCost).toBeTruthy();
    expect(noCost.monthlyAmount).toBe(Math.ceil(res.body.data.minPrice / noCost.tenureMonths));
  });

  it('recomputes EMI for a specific variant', async () => {
    const detail = await request(app).get('/api/v1/products/apple-iphone-16-pro');
    const variant = detail.body.data.variants.at(-1); // most expensive
    const res = await request(app)
      .get('/api/v1/products/apple-iphone-16-pro/emi')
      .query({ variantId: variant.id });
    expect(res.status).toBe(200);
    expect(res.body.data.principal).toBe(variant.price);
  });

  it('returns 404 for an unknown slug', async () => {
    const res = await request(app).get('/api/v1/products/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('no-cost EMI plans report zero interest and total equal to principal', async () => {
    const res = await request(app).get('/api/v1/products/apple-iphone-16-pro');
    const noCost = res.body.data.emiPlans.find((p: { isNoCost: boolean }) => p.isNoCost);
    expect(noCost).toBeTruthy();
    expect(noCost.interestPaid).toBe(0);
    expect(noCost.totalPayable).toBe(Math.round(res.body.data.minPrice));
  });

  it('sorts by price ascending across the full result set', async () => {
    const res = await request(app).get('/api/v1/products').query({ sort: 'price_asc', limit: 50 });
    expect(res.status).toBe(200);
    const prices = (res.body.data as { minPrice: number }[]).map((p) => p.minPrice);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('sorts by price descending across the full result set', async () => {
    const res = await request(app).get('/api/v1/products').query({ sort: 'price_desc', limit: 50 });
    expect(res.status).toBe(200);
    const prices = (res.body.data as { minPrice: number }[]).map((p) => p.minPrice);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('full-text search finds a product by name', async () => {
    const res = await request(app).get('/api/v1/products').query({ search: 'iphone' });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect((res.body.data as { slug: string }[]).some((p) => p.slug.includes('iphone'))).toBe(true);
  });

  it('search with no matches returns an empty page, not an error', async () => {
    const res = await request(app).get('/api/v1/products').query({ search: 'zzzznotarealproduct' });
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it('paginates with a correct meta envelope', async () => {
    const res = await request(app).get('/api/v1/products').query({ limit: 1, page: 1 });
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.meta.limit).toBe(1);
    expect(res.body.meta.page).toBe(1);
    expect(res.body.meta.totalPages).toBe(res.body.meta.total);
  });

  it('rejects an out-of-range limit with 422', async () => {
    const res = await request(app).get('/api/v1/products').query({ limit: 999 });
    expect(res.status).toBe(422);
    expect(res.body.success).toBe(false);
  });

  it('rejects a non-uuid variantId with 422', async () => {
    const res = await request(app)
      .get('/api/v1/products/apple-iphone-16-pro/emi')
      .query({ variantId: 'not-a-uuid' });
    expect(res.status).toBe(422);
  });

  it('returns 404 for a valid-but-unknown variantId (no silent fallback)', async () => {
    const res = await request(app)
      .get('/api/v1/products/apple-iphone-16-pro/emi')
      .query({ variantId: '00000000-0000-4000-8000-000000000000' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('serves product images with an ETag and honours If-None-Match (304)', async () => {
    const detail = await request(app).get('/api/v1/products/apple-iphone-16-pro');
    const imageUrl: string | null = detail.body.data.imageUrl;
    expect(imageUrl).toBeTruthy();
    const img = await request(app).get(imageUrl as string);
    expect(img.status).toBe(200);
    expect(img.headers['content-type']).toMatch(/^image\//);
    const etag = img.headers['etag'] as string | undefined;
    expect(etag).toBeTruthy();
    const cached = await request(app)
      .get(imageUrl as string)
      .set('If-None-Match', etag ?? '');
    expect(cached.status).toBe(304);
  });

  it('returns 404 for an unknown image id', async () => {
    const res = await request(app).get('/api/v1/images/00000000-0000-4000-8000-000000000000');
    expect(res.status).toBe(404);
  });
});
