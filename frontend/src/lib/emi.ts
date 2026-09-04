import type { EmiPlan } from '@/schemas/product';

/**
 * Client-side mirror of the backend EMI engine. Lets the product page
 * recompute instalments instantly when the shopper switches variants — no
 * round-trip needed. Kept byte-for-byte consistent with the server formula.
 */
export function computeMonthly(
  principal: number,
  tenureMonths: number,
  annualRatePct: number,
): number {
  if (tenureMonths <= 0) return Math.round(principal);
  if (annualRatePct <= 0) return Math.ceil(principal / tenureMonths);
  const r = annualRatePct / 1200;
  const factor = Math.pow(1 + r, tenureMonths);
  return Math.round((principal * r * factor) / (factor - 1));
}

/** Recompute a stored plan template for a specific price (selected variant). */
export function recomputePlan(plan: EmiPlan, principal: number): EmiPlan {
  const monthlyAmount = computeMonthly(principal, plan.tenureMonths, plan.interestRate);
  const totalPayable = monthlyAmount * plan.tenureMonths;
  const interestPaid = Math.max(0, totalPayable - principal);
  const effectiveCost = totalPayable - plan.cashbackAmount;
  return { ...plan, monthlyAmount, totalPayable, interestPaid, effectiveCost };
}

export function recomputePlans(plans: EmiPlan[], principal: number): EmiPlan[] {
  return plans.map((p) => recomputePlan(p, principal));
}
