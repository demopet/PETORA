import { faker } from '@faker-js/faker';

export function createUserFactory(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || faker.string.uuid(),
    username: overrides.username || faker.internet.userName(),
    pin_hash: overrides.pin_hash || '$2b$12$test',
    role: overrides.role || 'OWNER',
    full_name: overrides.full_name || faker.person.fullName(),
    customer_id: overrides.customer_id || null,
    created_by: overrides.created_by || null,
    failed_login_attempts: overrides.failed_login_attempts ?? 0,
    locked_until: overrides.locked_until || null,
    is_active: overrides.is_active ?? true,
    last_login_at: overrides.last_login_at || null,
    created_at: overrides.created_at || new Date().toISOString(),
    updated_at: overrides.updated_at || new Date().toISOString(),
    ...overrides,
  };
}
