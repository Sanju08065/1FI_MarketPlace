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
});
