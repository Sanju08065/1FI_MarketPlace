import { describe, expect, it } from 'vitest';
import { computeEmi, computeMonthly } from '../src/modules/emi/emi.service';

// Pure unit tests for the EMI engine — no database required. These guard the
// reducing-balance formula and the no-cost semantics (the parts most likely to
// regress and hardest to eyeball).

describe('computeMonthly', () => {
  it('matches the standard reducing-balance amortisation for a known input', () => {
    // ₹1,00,000 over 12 months at 12% p.a. (1%/mo) → well-known EMI ≈ 8884.88.
    expect(computeMonthly(100000, 12, 12)).toBe(8885);
  });

  it('treats 0% as no-cost: ceil(principal / tenure)', () => {
    expect(computeMonthly(134900, 3, 0)).toBe(Math.ceil(134900 / 3));
    expect(computeMonthly(100000, 4, 0)).toBe(25000);
  });

  it('never divides by zero for a degenerate tenure', () => {
    expect(computeMonthly(50000, 0, 12)).toBe(50000);
  });
});

describe('computeEmi', () => {
  it('no-cost plans have exactly zero interest and total equal to principal', () => {
    const r = computeEmi(134900, 3, 0);
    expect(r.interestPaid).toBe(0);
    expect(r.totalPayable).toBe(134900);
    expect(r.monthlyAmount).toBe(Math.ceil(134900 / 3));
  });

  it('interest-bearing plans charge positive interest above the principal', () => {
    const r = computeEmi(100000, 12, 12);
    expect(r.monthlyAmount).toBe(8885);
    expect(r.totalPayable).toBe(8885 * 12);
    expect(r.interestPaid).toBe(8885 * 12 - 100000);
    expect(r.interestPaid).toBeGreaterThan(0);
  });

  it('cashback lowers the effective cost but not the total payable', () => {
    const r = computeEmi(100000, 6, 0, 2000);
    expect(r.totalPayable).toBe(100000);
    expect(r.effectiveCost).toBe(98000);
    expect(r.interestPaid).toBe(0);
  });
});
