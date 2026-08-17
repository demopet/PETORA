import { faker } from '@faker-js/faker';
import type { Appointment } from '@/types/appointment';

export function createAppointmentFactory(overrides: Partial<Appointment> = {}): Appointment {
  return {
    id: overrides.id || faker.string.uuid(),
    customer_id: overrides.customer_id || faker.string.uuid(),
    pet_id: overrides.pet_id || faker.string.uuid(),
    doctor_id: overrides.doctor_id || null,
    appointment_date: overrides.appointment_date || faker.date.soon({ days: 7 }).toISOString().split('T')[0],
    appointment_time: overrides.appointment_time || `${faker.number.int({ min: 8, max: 17 })}:00`,
    queue_number: overrides.queue_number || faker.number.int({ min: 1, max: 50 }),
    status: overrides.status || 'WAITING',
    complaint: overrides.complaint || faker.lorem.sentence(),
    notes: overrides.notes || null,
    is_from_portal: overrides.is_from_portal ?? false,
    created_at: overrides.created_at || new Date().toISOString(),
    updated_at: overrides.updated_at || new Date().toISOString(),
    ...overrides,
  };
}
