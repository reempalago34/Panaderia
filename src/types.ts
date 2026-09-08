// Tipado TypeScript de la Maquina de Estados de Navegacion SPA y Entidades de MazaMadre Control

export type AppView = 
  | 'AUTH'             // SCR-01: Login / Inicio de Sesión
  | 'DASHBOARD'        // SCR-02: Dashboard Principal Operativo
  | 'RAW_MATERIALS'    // SCR-03: Inventario de Materias Primas e Insumos
  | 'PRODUCTS_RECIPES' // SCR-04: Catálogo de Productos y Fichas Técnicas
  | 'ORDER_CREATE'     // SCR-05: Wizard de Registro de Pedidos por Encargo
  | 'ORDER_DETAIL'     // SCR-04: Vista 360° de Detalle del Pedido por Encargo
  | 'KITCHEN_DAILY'    // SCR-07: Consolidado Diario de Producción en Cocina
  | 'SETTINGS';        // SCR-06: Configuración del Sistema y Reglas

export interface NavigationState {
  currentView: AppView;
  selectedItemId: string | null; // Id para visualización detallada (ej. order_id para ORDER_DETAIL)
  filterCategory?: string | null;
  searchQuery?: string;
}

export type UserRole = 'admin' | 'head_baker' | 'production_manager' | 'cashier' | 'customer';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  created_at?: string;
}

export interface UserAccount extends UserProfile {
  password?: string;
}

export type RawMaterialCategory = 
  | 'harinas'
  | 'levaduras_masa'
  | 'lacteos'
  | 'grasas'
  | 'azucares_chocolates'
  | 'frutos_semillas'
  | 'empaques'
  | 'otros';

export type RawMaterialUnit = 'kg' | 'g' | 'l' | 'ml' | 'ud';

export type StockStatus = 'OPTIMAL' | 'CRITICAL' | 'OUT_OF_STOCK';

export interface RawMaterial {
  id: string;
  sku: string;
  name: string;
  category: RawMaterialCategory;
  unit: RawMaterialUnit;
  current_stock: number;
  minimum_stock: number;
  cost_per_unit: number;
  supplier: string;
  last_restocked_at: string;
  status: StockStatus;
}

export type ProductCategory = 'panaderia' | 'viennoiserie' | 'pasteleria' | 'salados';

export interface RecipeItem {
  id: string;
  product_id: string;
  raw_material_id: string;
  quantity: number; // en la unidad del insumo
  unit: RawMaterialUnit;
  notes?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  description: string;
  price: number;
  preparation_time_hours: number;
  portions_or_weight: string;
  is_active: boolean;
  image_url: string;
}

export type OrderStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'READY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'BLOCKED_BY_INSUMOS';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'bizum' | 'tarjeta';

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  created_at: string;
  delivery_date: string; // ISO string
  status: OrderStatus;
  total_amount: number;
  deposit_amount: number;
  remaining_balance: number;
  payment_method: PaymentMethod;
  notes?: string;
  blocked_reason?: string;
}

export interface BakerySettings {
  name: string;
  business_name?: string;
  legal_name: string;
  tax_id: string;
  address: string;
  phone: string;
  email: string;
  minimum_deposit_percentage: number; // Default 50 (%)
  minimum_advance_hours: number;      // Default 24 (horas)
  currency_symbol: string;
  supabase_url: string;
  supabase_anon_key: string;
  is_supabase_connected: boolean;
}

// Explosión de recetas consolidada
export interface IngredientExplosionRequirement {
  raw_material: RawMaterial;
  required_quantity: number;
  current_stock: number;
  deficit: number; // > 0 si falta stock
  is_sufficient: boolean;
}
