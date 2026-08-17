export type RoomStatus = 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE' | 'INACTIVE';
export type RoomCleanliness = 'CLEAN' | 'DIRTY' | 'UNDER_CLEANING';
export type PetHotelBookingStatus = 'BOOKED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
export type PetHotelLogType = 'FEEDING' | 'MEDICINE' | 'NOTE';

export interface Room extends SoftDeletable {
  name: string;
  room_number: string | null;
  room_type: string;
  price_per_night: number;
  capacity: number;
  status: RoomStatus;
  cleanliness: RoomCleanliness;
  maintenance_status: boolean;
  is_active: boolean;
}

export interface PetHotelBooking extends BaseEntity {
  booking_number: string;
  pet_id: UUID;
  customer_id: UUID;
  room_id: UUID | null;
  check_in_date: string;
  check_out_date: string;
  actual_check_in_at: Timestamp | null;
  actual_check_out_at: Timestamp | null;
  price_per_night: number;
  total_price: number;
  status: PetHotelBookingStatus;
  special_notes: string | null;
  is_from_portal: boolean;
}

export interface PetHotelLog extends BaseEntity {
  booking_id: UUID;
  log_type: PetHotelLogType;
  description: string | null;
  photo_urls: string[];
  logged_at: Timestamp;
}

export interface CreatePetHotelBookingInput {
  pet_id: UUID;
  customer_id: UUID;
  room_id?: UUID;
  check_in_date: string;
  check_out_date: string;
  price_per_night?: number;
  special_notes?: string;
  is_from_portal?: boolean;
}

export interface CreatePetHotelLogInput {
  booking_id: UUID;
  log_type: PetHotelLogType;
  description?: string;
  photo_urls?: string[];
}
