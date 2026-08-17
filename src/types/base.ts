export type UUID = string;
export type Timestamp = string;

export interface BaseEntity {
  id: UUID;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface SoftDeletable extends BaseEntity {
  deleted_at: Timestamp | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
