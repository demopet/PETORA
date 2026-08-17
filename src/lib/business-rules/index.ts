export function calculateLoyaltyPoints(totalAmount: number, pointMultiplier: number): number {
  const basePoints = Math.floor(totalAmount / 10000);
  return Math.floor(basePoints * pointMultiplier);
}

export function canRedeemPoints(availablePoints: number, pointsToRedeem: number): boolean {
  return availablePoints >= pointsToRedeem && pointsToRedeem > 0;
}

export function calculateInvoiceTotal({
  subtotal,
  discount = 0,
  tax = 0,
}: {
  subtotal: number;
  discount?: number;
  tax?: number;
}): number {
  return subtotal - discount + tax;
}

export function calculateChange(paid: number, total: number): number {
  if (paid < total) {
    throw new Error('Insufficient payment');
  }
  return paid - total;
}

export function validateStockAvailability(currentStock: number, requiredQty: number): boolean {
  return currentStock >= requiredQty;
}

export function calculateReorderSuggestion({
  currentStock,
  minimumStock,
  averageDailySales,
  leadTimeDays,
}: {
  currentStock: number;
  minimumStock: number;
  averageDailySales: number;
  leadTimeDays: number;
}): number {
  const suggestion = minimumStock - currentStock + averageDailySales * leadTimeDays;
  return Math.max(0, suggestion);
}
