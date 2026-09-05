/**
 * EMI computation engine.
 *
 * EMI plans are stored as templates (tenure + interest rate + cashback). The
 * monthly amount is derived from the *actual* price of the selected variant,
 * so a ₹1,34,900 config and a ₹1,54,900 config show genuinely different EMIs —
 * exactly like a real financing product page.
 */

export interface EmiComputation {
  principal: number;
  monthlyAmount: number;
  totalPayable: number;
  interestPaid: number;
  effectiveCost: number;
}

/** Monthly instalment. No-cost = principal / tenure; else reducing-balance. */
export function computeMonthly(
  principal: number,
  tenureMonths: number,
  annualRatePct: number,
): number {
  if (tenureMonths <= 0) return Math.round(principal);
  if (annualRatePct <= 0) return Math.ceil(principal / tenureMonths);

  const r = annualRatePct / 1200; // monthly rate
  const factor = Math.pow(1 + r, tenureMonths);
  return Math.round((principal * r * factor) / (factor - 1));
}

export function computeEmi(
  principal: number,
  tenureMonths: number,
  annualRatePct: number,
  cashback = 0,
): EmiComputation {
  const monthlyAmount = computeMonthly(principal, tenureMonths, annualRatePct);
  const roundedPrincipal = Math.round(principal);

  // No-cost (0% APR, or a degenerate tenure): the customer repays exactly the
  // principal, spread across the tenure. The displayed monthly is the rounded
  // instalment; the final instalment absorbs the rounding remainder, so the
  // total payable equals the principal and there is genuinely zero interest.
  const noCost = annualRatePct <= 0 || tenureMonths <= 0;
  const totalPayable = noCost ? roundedPrincipal : monthlyAmount * tenureMonths;
  const interestPaid = Math.max(0, totalPayable - roundedPrincipal);
  const effectiveCost = totalPayable - cashback;

  return { principal, monthlyAmount, totalPayable, interestPaid, effectiveCost };
}
