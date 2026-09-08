// Reglas de Control de Acceso Basado en Roles (RBAC) y Verificación de Identidad para MazaMadre Control
import { UserRole, AppView } from '../types';

export interface RoleCapability {
  role: UserRole;
  label: string;
  badgeLabel: string;
  branchDescription: string;
  allowedViews: AppView[];
  canViewFinancialMargins: boolean;
  canEditRecipes: boolean;
  canViewRecipeFormulas: boolean;
  canManageRawMaterials: boolean;
  canAccessKitchenDaily: boolean;
  canViewAllCustomerOrders: boolean;
  canModifyOrderStatuses: boolean;
  canAccessSettings: boolean;
  canViewTeamDirectory: boolean;
  canManageTeam: boolean;
}

export const ROLE_CAPABILITIES: Record<UserRole, RoleCapability> = {
  customer: {
    role: 'customer',
    label: 'Cliente / Comprador Particular',
    badgeLabel: 'Cliente Particular',
    branchDescription: 'Consulta de catálogo de productos artesanales, realización de encargos personalizados y seguimiento de sus propios pedidos.',
    allowedViews: ['PRODUCTS_RECIPES', 'ORDER_CREATE', 'ORDER_DETAIL', 'AUTH'],
    canViewFinancialMargins: false,
    canEditRecipes: false,
    canViewRecipeFormulas: false,
    canManageRawMaterials: false,
    canAccessKitchenDaily: false,
    canViewAllCustomerOrders: false,
    canModifyOrderStatuses: false,
    canAccessSettings: false,
    canViewTeamDirectory: false,
    canManageTeam: false
  },
  cashier: {
    role: 'cashier',
    label: 'Atención en Mostrador y Caja',
    badgeLabel: 'Mostrador / Caja',
    branchDescription: 'Recepción de clientes, registro de encargos en mostrador con 50% de anticipo (RN-01), seguimiento de pedidos y cobro de saldos en entrega.',
    allowedViews: ['DASHBOARD', 'ORDER_CREATE', 'ORDER_DETAIL', 'PRODUCTS_RECIPES', 'AUTH'],
    canViewFinancialMargins: false,
    canEditRecipes: false,
    canViewRecipeFormulas: false,
    canManageRawMaterials: false,
    canAccessKitchenDaily: false,
    canViewAllCustomerOrders: true,
    canModifyOrderStatuses: true,
    canAccessSettings: false,
    canViewTeamDirectory: false,
    canManageTeam: false
  },
  head_baker: {
    role: 'head_baker',
    label: 'Maestro Panadero / Jefe de Obrador',
    badgeLabel: 'Maestro Panadero',
    branchDescription: 'Formulación de masas madre, fichas técnicas de recetas, control de tiempos de fermentación y consolidado diario de horneado en cocina.',
    allowedViews: ['PRODUCTS_RECIPES', 'KITCHEN_DAILY', 'RAW_MATERIALS', 'AUTH'],
    canViewFinancialMargins: true,
    canEditRecipes: true,
    canViewRecipeFormulas: true,
    canManageRawMaterials: false, // Solo consulta de existencias
    canAccessKitchenDaily: true,
    canViewAllCustomerOrders: false,
    canModifyOrderStatuses: false,
    canAccessSettings: false,
    canViewTeamDirectory: false,
    canManageTeam: false
  },
  production_manager: {
    role: 'production_manager',
    label: 'Encargada de Producción y Almacén',
    badgeLabel: 'Producción & Almacén',
    branchDescription: 'Control de inventario de materias primas, alertas de stock mínimo, reabastecimiento de proveedores y deducción masiva de cocina (RN-03).',
    allowedViews: ['RAW_MATERIALS', 'KITCHEN_DAILY', 'PRODUCTS_RECIPES', 'AUTH'],
    canViewFinancialMargins: true,
    canEditRecipes: false,
    canViewRecipeFormulas: true,
    canManageRawMaterials: true,
    canAccessKitchenDaily: true,
    canViewAllCustomerOrders: false,
    canModifyOrderStatuses: false,
    canAccessSettings: false,
    canViewTeamDirectory: false,
    canManageTeam: false
  },
  admin: {
    role: 'admin',
    label: 'Administrador / Propietario',
    badgeLabel: 'Administrador',
    branchDescription: 'Acceso y supervisión total del sistema: gestión de márgenes de utilidad, altas y bajas de personal, configuración fiscal, conexión Supabase y auditoría.',
    allowedViews: ['DASHBOARD', 'RAW_MATERIALS', 'PRODUCTS_RECIPES', 'ORDER_CREATE', 'ORDER_DETAIL', 'KITCHEN_DAILY', 'SETTINGS', 'AUTH'],
    canViewFinancialMargins: true,
    canEditRecipes: true,
    canViewRecipeFormulas: true,
    canManageRawMaterials: true,
    canAccessKitchenDaily: true,
    canViewAllCustomerOrders: true,
    canModifyOrderStatuses: true,
    canAccessSettings: true,
    canViewTeamDirectory: true,
    canManageTeam: true
  }
};

/**
 * Verifica si un rol específico tiene autorización para acceder a una vista de la aplicación.
 */
export const isViewAllowedForRole = (role: UserRole, view: AppView): boolean => {
  if (view === 'AUTH') return true;
  if (role === 'admin') return true;
  const capabilities = ROLE_CAPABILITIES[role];
  return capabilities ? capabilities.allowedViews.includes(view) : false;
};

/**
 * Devuelve la vista principal por defecto a la que debe aterrizar el usuario según su rama de trabajo.
 */
export const getDefaultViewForRole = (role: UserRole): AppView => {
  switch (role) {
    case 'customer':
      return 'PRODUCTS_RECIPES';
    case 'cashier':
      return 'DASHBOARD';
    case 'head_baker':
      return 'PRODUCTS_RECIPES';
    case 'production_manager':
      return 'RAW_MATERIALS';
    case 'admin':
    default:
      return 'DASHBOARD';
  }
};
