export const TERM_MONTHS: Record<string, number> = {
  MONTHLY: 1,
  ANNUAL: 12,
  TWO_YEAR: 24,
};

export const TERM_DISCOUNT: Record<string, number> = {
  MONTHLY: 0,
  ANNUAL: 0.15,
  TWO_YEAR: 0.25,
};

export const TERM_LABELS: Record<string, string> = {
  MONTHLY: "Monthly",
  ANNUAL: "Annual (12 months, 15% discount)",
  TWO_YEAR: "Two-year (24 months, 25% discount)",
};

export function calcBaseProduct(
  seats: number,
  pricePerSeat: number,
  term: string
) {
  const months = TERM_MONTHS[term];
  const discount = TERM_DISCOUNT[term];
  const amount = seats * pricePerSeat * months * (1 - discount);
  const discountStr =
    discount > 0 ? ` × (1 - ${discount * 100}% discount)` : "";
  const calculation = `${seats} seats × $${pricePerSeat}/seat/month × ${months} months${discountStr}`;
  return { amount, calculation };
}

export function calcFixedAddon(priceValue: number, term: string) {
  const months = TERM_MONTHS[term];
  const amount = priceValue * months;
  const calculation = `$${priceValue}/month × ${months} months`;
  return { amount, calculation };
}

export function calcPerSeatAddon(
  addonSeats: number,
  priceValue: number,
  term: string
) {
  const months = TERM_MONTHS[term];
  const amount = addonSeats * priceValue * months;
  const calculation = `${addonSeats} seats × $${priceValue}/seat/month × ${months} months`;
  return { amount, calculation };
}

export function calcPercentAddon(
  baseProductTotal: number,
  priceValue: number
) {
  const amount = baseProductTotal * (priceValue / 100);
  const calculation = `${priceValue}% of $${baseProductTotal.toFixed(2)} base product cost`;
  return { amount, calculation };
}

export function calcQuoteTotal(
  baseAmount: number,
  addonAmounts: number[],
  discountPct: number
) {
  const subtotal = baseAmount + addonAmounts.reduce((a, b) => a + b, 0);
  const discountAmount = subtotal * (discountPct / 100);
  const total = subtotal - discountAmount;
  return { subtotal, discountAmount, total };
}
