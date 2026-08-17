import { faker } from '@faker-js/faker';

export function createCustomerFactory(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || faker.string.uuid(),
    name: overrides.name || faker.person.fullName(),
    phone: overrides.phone || faker.phone.number('+62 8## #### ####'),
    email: overrides.email || faker.internet.email(),
    address: overrides.address || faker.location.streetAddress(),
    emergency_contact: overrides.emergency_contact || null,
    photo_url: overrides.photo_url || null,
    notes: overrides.notes || null,
    is_guest: overrides.is_guest ?? false,
    tags: overrides.tags || [],
    is_active: overrides.is_active ?? true,
    created_at: overrides.created_at || new Date().toISOString(),
    updated_at: overrides.updated_at || new Date().toISOString(),
    deleted_at: overrides.deleted_at || null,
    ...overrides,
  };
}
