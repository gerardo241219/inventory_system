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

export type ProductType = 'materia_prima' | 'material_empaque' | 'granel' | 'terminado' | 'general';
export type ProductionArea = 'almacen' | 'cocina_churros' | 'cocina_papas' | 'envasado' | 'embarque';

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
  productType: ProductType;
  productionArea?: ProductionArea;
  categoryId?: number;
  unitOfMeasureId?: number;
  businessId: number;
  category?: Category;
  unitOfMeasure?: UnitOfMeasure;
}

// ── Producción ────────────────────────────────────────────────────────────────
export type ProductionOrderStatus = 'borrador' | 'en_proceso' | 'completado' | 'cancelado';
export type ProductionOrderArea   = 'cocina_churros' | 'cocina_papas' | 'envasado';
export type ProductionItemType    = 'input' | 'output';

export interface ProductionOrderItem {
  id: number;
  productionOrderId: number;
  productId: number;
  quantity: number;
  itemType: ProductionItemType;
  unitCost: number;
  product?: Product;
}

export interface ProductionOrder {
  id: number;
  folio: string;
  area: ProductionOrderArea;
  status: ProductionOrderStatus;
  notes?: string;
  completedAt?: string;
  userId: number;
  businessId: number;
  createdAt: string;
  items: ProductionOrderItem[];
  user?: User;
}

// ── Ventas ────────────────────────────────────────────────────────────────────
export type SaleOrderStatus = 'borrador' | 'confirmada' | 'embarcada' | 'cancelada';

export interface SaleOrderItem {
  id: number;
  saleOrderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
}

export interface SaleOrder {
  id: number;
  folio: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  status: SaleOrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  shippedAt?: string;
  userId: number;
  businessId: number;
  createdAt: string;
  items: SaleOrderItem[];
  user?: User;
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
