import { faker } from '@faker-js/faker';

export function createProductFactory(overrides: Record<string, any> = {}) {
  const purchasePrice = overrides.purchase_price || faker.number.int({ min: 10000, max: 500000 });

  return {
    id: overrides.id || faker.string.uuid(),
    sku: overrides.sku || `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    name: overrides.name || faker.commerce.productName(),
    category_id: overrides.category_id || null,
    supplier_id: overrides.supplier_id || null,
    barcode: overrides.barcode || faker.string.numeric(13),
    description: overrides.description || faker.commerce.productDescription(),
    purchase_price: purchasePrice,
    selling_price: overrides.selling_price || Math.round(purchasePrice * 1.3),
    stock_quantity: overrides.stock_quantity ?? faker.number.int({ min: 0, max: 100 }),
    stock_minimum: overrides.stock_minimum ?? 5,
    stock_maximum: overrides.stock_maximum ?? 100,
    photo_url: overrides.photo_url || null,
    expiry_date: overrides.expiry_date || null,
    status: overrides.status || 'ACTIVE',
    created_at: overrides.created_at || new Date().toISOString(),
    updated_at: overrides.updated_at || new Date().toISOString(),
    deleted_at: overrides.deleted_at || null,
    ...overrides,
  };
}
