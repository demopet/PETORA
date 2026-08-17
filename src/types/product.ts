import type { SoftDeletable, BaseEntity, UUID } from './base';

export type ProductStatus = 'ACTIVE' | 'ARCHIVED';
export type StockMovementType = 'IN' | 'OUT' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGED' | 'EXPIRED' | 'OPNAME';

export interface Category extends BaseEntity {
  name: string;
  description: string | null;
  parent_id: UUID | null;
  is_active: boolean;
}

export interface Supplier extends BaseEntity {
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  lead_time_days: number | null;
  is_active: boolean;
}

export interface Product extends SoftDeletable {
  sku: string;
  name: string;
  category_id: UUID | null;
  supplier_id: UUID | null;
  barcode: string | null;
  description: string | null;
  purchase_price: number;
  selling_price: number;
  stock_quantity: number;
  stock_minimum: number;
  stock_maximum: number;
  photo_url: string | null;
  expiry_date: string | null;
  status: ProductStatus;
}

export interface CreateProductInput {
  sku: string;
  name: string;
  category_id?: UUID;
  supplier_id?: UUID;
  barcode?: string;
  description?: string;
  purchase_price: number;
  selling_price: number;
  stock_quantity?: number;
  stock_minimum?: number;
  stock_maximum?: number;
  photo_url?: string;
  expiry_date?: string;
}

export type UpdateProductInput = Partial<CreateProductInput>;

export interface ProductVariant extends BaseEntity {
  product_id: UUID;
  variant_name: string;
  variant_value: string;
  price_adjustment: number;
  stock_quantity: number;
}

export interface ProductBundle extends BaseEntity {
  name: string;
  description: string | null;
  bundle_price: number;
  is_active: boolean;
}

export interface StockMovement extends BaseEntity {
  product_id: UUID;
  movement_type: StockMovementType;
  quantity: number;
  reference_type: string | null;
  reference_id: UUID | null;
  notes: string | null;
  created_by: UUID;
}

export interface CreateStockMovementInput {
  product_id: UUID;
  movement_type: StockMovementType;
  quantity: number;
  reference_type?: string;
  reference_id?: UUID;
  notes?: string;
}
