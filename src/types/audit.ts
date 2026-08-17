import type { BaseEntity, UUID } from './base';

export interface AuditLog extends BaseEntity {
  user_id: UUID | null;
  action: string;
  entity_type: string;
  entity_id: UUID | null;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  ip_address: string | null;
  user_agent: string | null;
}
