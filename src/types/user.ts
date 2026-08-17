import type { BaseEntity, UUID, Timestamp } from './base';

export type UserRole = 'OWNER' | 'ADMIN' | 'DOKTER' | 'KASIR' | 'CUSTOMER';

export interface User extends BaseEntity {
  username: string;
  pin_hash: string;
  role: UserRole;
  full_name: string;
  customer_id: UUID | null;
  created_by: UUID | null;
  failed_login_attempts: number;
  locked_until: Timestamp | null;
  is_active: boolean;
  last_login_at: Timestamp | null;
}

export interface LoginCredentials {
  username: string;
  pin: string;
}

export interface LoginResponse {
  user: Omit<User, 'pin_hash'>;
  session_token: string;
}

export interface Session {
  user_id: UUID;
  role: UserRole;
  expires_at: Timestamp;
}

export interface CreateUserInput {
  username: string;
  pin: string;
  role: UserRole;
  full_name: string;
  customer_id?: UUID;
}

export interface UpdatePinInput {
  old_pin: string;
  new_pin: string;
}
