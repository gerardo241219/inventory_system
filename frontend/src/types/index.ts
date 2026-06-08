export interface Business {
  id: number;
  name: string;
  type: string;
  description?: string;
  logo?: string;
  settings: Record<string, unknown>;
  isActive: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  isActive: boolean;
  businessId: number;
  business?: Business;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  businessId: number;
  isActive: boolean;
}

export interface UnitOfMeasure {
  id: number;
  code: string;
  name: string;
  businessId?: number;
}

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
  classification: string;
  status: 'A' | 'I';
  categoryId?: number;
  unitOfMeasureId?: number;
  businessId: number;
  category?: Category;
  unitOfMeasure?: UnitOfMeasure;
}

export interface Supplier {
  id: number;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
  rfc?: string;
  isActive: boolean;
  businessId: number;
}

export type MovementType = 'entrada' | 'salida' | 'ajuste';

export interface InventoryMovement {
  id: number;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  cost?: number;
  reason?: string;
  notes?: string;
  referenceNumber?: string;
  productId: number;
  userId: number;
  supplierId?: number;
  businessId: number;
  createdAt: string;
  product?: Product;
  user?: User;
  supplier?: Supplier;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardSummary {
  totalProducts: number;
  lowStockCount: number;
  movementsToday: number;
  totalInventoryValue: string;
}

export interface StockValuationReport {
  products: (Product & { stockValue: string })[];
  totalValue: string;
}
