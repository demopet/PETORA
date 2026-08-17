import { faker } from '@faker-js/faker';
import type { Pet } from '@/types/pet';

export function createPetFactory(overrides: Partial<Pet> = {}): Pet {
  const species = overrides.species || faker.helpers.arrayElement(['Dog', 'Cat', 'Rabbit']);

  return {
    id: overrides.id || faker.string.uuid(),
    customer_id: overrides.customer_id || faker.string.uuid(),
    name: overrides.name || faker.person.firstName(),
    species,
    breed: overrides.breed || faker.helpers.arrayElement([
      'Golden Retriever', 'Persian', 'Husky', 'Anggora', 'Labrador'
    ]),
    birth_date: overrides.birth_date || faker.date.past({ years: 5 }).toISOString().split('T')[0],
    gender: overrides.gender || faker.helpers.arrayElement(['M', 'F']),
    photo_url: overrides.photo_url || null,
    microchip_number: overrides.microchip_number || faker.string.numeric(15),
    is_active: overrides.is_active ?? true,
    created_at: overrides.created_at || new Date().toISOString(),
    updated_at: overrides.updated_at || new Date().toISOString(),
    deleted_at: overrides.deleted_at || null,
    ...overrides,
  };
}
