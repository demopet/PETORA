import { faker } from '@faker-js/faker';

export function createInvoiceFactory(overrides: Record<string, any> = {}) {
  const subtotal = overrides.subtotal || faker.number.int({ min: 50000, max: 2000000 });
  const discount = overrides.discount_amount || 0;
  const tax = overrides.tax_amount || 0;
  const total = subtotal - discount + tax;

  return {
    id: overrides.id || faker.string.uuid(),
    invoice_number: overrides.invoice_number || `INV-${faker.string.numeric(8)}`,
    invoice_type: overrides.invoice_type || 'POS',
    customer_id: overrides.customer_id || null,
    subtotal,
    discount_amount: discount,
    tax_amount: tax,
    total_amount: overrides.total_amount || total,
    paid_amount: overrides.paid_amount || 0,
    status: overrides.status || 'UNPAID',
    promotion_id: overrides.promotion_id || null,
    loyalty_points_earned: overrides.loyalty_points_earned || 0,
    loyalty_points_redeemed: overrides.loyalty_points_redeemed || 0,
    notes: overrides.notes || null,
    created_by: overrides.created_by || faker.string.uuid(),
    created_at: overrides.created_at || new Date().toISOString(),
    updated_at: overrides.updated_at || new Date().toISOString(),
    ...overrides,
  };
}
