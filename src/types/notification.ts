import type { BaseEntity, UUID } from './base';

export interface Notification extends BaseEntity {
  user_id: UUID | null;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data: Record<string, unknown> | null;
}
