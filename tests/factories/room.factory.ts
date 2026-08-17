import { faker } from '@faker-js/faker';

export function createRoomFactory(overrides: Record<string, any> = {}) {
  return {
    id: overrides.id || faker.string.uuid(),
    name: overrides.name || `Room ${faker.string.numeric(3)}`,
    room_number: overrides.room_number || faker.string.alphanumeric(5).toUpperCase(),
    room_type: overrides.room_type || faker.helpers.arrayElement(['STANDARD', 'DELUXE', 'VIP', 'LARGE']),
    price_per_night: overrides.price_per_night || faker.number.int({ min: 100000, max: 500000 }),
    capacity: overrides.capacity || 1,
    status: overrides.status || 'AVAILABLE',
    cleanliness: overrides.cleanliness || 'CLEAN',
    maintenance_status: overrides.maintenance_status ?? false,
    is_active: overrides.is_active ?? true,
    created_at: overrides.created_at || new Date().toISOString(),
    updated_at: overrides.updated_at || new Date().toISOString(),
    deleted_at: overrides.deleted_at || null,
    ...overrides,
  };
}
