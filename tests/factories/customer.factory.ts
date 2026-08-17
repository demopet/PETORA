import { faker } from '@faker-js/faker';
import type { Customer } from '@/types/customer';

export function createCustomerFactory(overrides: Partial<Customer> = {}): Customer {
  return {
    id: overrides.id || faker.string.uuid(),
    name: overrides.name || faker.person.fullName(),
    phone: overrides.phone || faker.phone.number(),
    email: overrides.email || faker.internet.email(),
    address: overrides.address || null,
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
