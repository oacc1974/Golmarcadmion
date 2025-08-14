export interface MetaData {
  source: string;
  synced_at: Date;
  last_modified_at: Date;
  schema_version: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface Payment {
  method: 'cash' | 'card' | 'other';
  amount: number; // Will be stored as Decimal128 in MongoDB
  tender_id?: string;
  ref_code?: string;
}

export interface LineItem {
  item_loyverse_id: string;
  name: string;
  category: string;
  quantity: number;
  price: number; // Will be stored as Decimal128 in MongoDB
  discount: number; // Will be stored as Decimal128 in MongoDB
  tax: number; // Will be stored as Decimal128 in MongoDB
  total: number; // Will be stored as Decimal128 in MongoDB
  modifiers?: any[];
}

export interface PurchaseOrderLine {
  item_loyverse_id: string;
  qty_ordered: number;
  qty_received?: number;
  unit_cost: number; // Will be stored as Decimal128 in MongoDB
  tax?: number; // Will be stored as Decimal128 in MongoDB
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'gerente',
  CASHIER = 'cajero',
  AUDITOR = 'auditor',
}
