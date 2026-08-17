import type { SoftDeletable, UUID, BaseEntity } from './base';

export interface Pet extends SoftDeletable {
  customer_id: UUID;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  gender: string | null;
  photo_url: string | null;
  microchip_number: string | null;
  is_active: boolean;
}

export interface CreatePetInput {
  customer_id: UUID;
  name: string;
  species: string;
  breed?: string;
  birth_date?: string;
  gender?: string;
  photo_url?: string;
  microchip_number?: string;
}

export interface UpdatePetInput extends Partial<CreatePetInput> {}

export interface PetWeightLog extends BaseEntity {
  pet_id: UUID;
  weight_kg: number;
  recorded_at: string;
}

export interface PetVaccine extends SoftDeletable {
  pet_id: UUID;
  vaccine_name: string;
  vaccination_date: string;
  due_date: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface PetDisease extends SoftDeletable {
  pet_id: UUID;
  disease_name: string;
  diagnosed_date: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface PetAllergy extends SoftDeletable {
  pet_id: UUID;
  allergen: string;
  notes: string | null;
  is_active: boolean;
}
