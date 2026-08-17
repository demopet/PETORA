import type { BaseEntity, UUID } from './base';

export type AppointmentStatus = 'WAITING' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface Appointment extends BaseEntity {
  customer_id: UUID;
  pet_id: UUID;
  doctor_id: UUID | null;
  appointment_date: string;
  appointment_time: string;
  queue_number: number | null;
  status: AppointmentStatus;
  complaint: string | null;
  notes: string | null;
  is_from_portal: boolean;
}

export interface CreateAppointmentInput {
  customer_id: UUID;
  pet_id: UUID;
  doctor_id?: UUID;
  appointment_date: string;
  appointment_time: string;
  complaint?: string;
  notes?: string;
  is_from_portal?: boolean;
}

export interface UpdateAppointmentStatusInput {
  status: AppointmentStatus;
}
