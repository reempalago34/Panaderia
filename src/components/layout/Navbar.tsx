import React from 'react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types';
import {
  Wheat,
  LayoutDashboard,
  Package,
  BookOpen,
  PlusCircle,
  ChefHat,
  Settings,
  User,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  LogIn,
  ShoppingBag
} from 'lucide-react';
import { isViewAllowedForRole, getDefaultViewForRole, ROLE_CAPABILITIES } from '../../utils/permissions';

export const Navbar: React.FC = () => {
  const { navigation, navigateTo, currentUser, logout, rawMaterials, orders, settings } = useApp();

  // Calculate live badge counts
  const criticalMaterialsCount = rawMaterials.filter((m) => m.status === 'CRITICAL' || m.status === 'OUT_OF_STOCK').length;
  const activeOrdersCount = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const blockedOrdersCount = orders.filter((o) => o.status === 'BLOCKED_BY_INSUMOS').length;

  // Tailored navigation items based on the verified role
  const getNavItems = (): Array<{ view: AppView; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }> => {
    if (!currentUser) return [];

    const role = currentUser.role;

    // Customer: Only public craft catalog, custom order wizard, and order tracking
    if (role === 'customer') {
      const myOrders = orders.filter(
        (o) => o.customer_email.toLowerCase() === currentUser.email.toLowerCase() && o.status !== 'CANCELLED'
      );
      const activeMyOrders = myOrders.filter((o) => o.status !== 'DELIVERED').length;

      return [
        {
          view: 'PRODUCTS_RECIPES',
          label: 'Catálogo de Panadería',
          icon: <BookOpen className="w-4 h-4 text-amber-400" />
        },
        {
          view: 'ORDER_CREATE',
          label: '+ Hacer Encargo',
          icon: <PlusCircle className="w-4 h-4 text-amber-400" />
        },
        ...(myOrders.length > 0
          ? [
              {
                view: 'ORDER_DETAIL' as AppView,
                label: 'Mis Encargos',
                icon: <ShoppingBag className="w-4 h-4 text-emerald-400" />,
                badge: activeMyOrders > 0 ? activeMyOrders : undefined,
                badgeColor: 'bg-emerald-500 text-white'
              }
            ]
          : [])
      ];
    }

    // Cashier: Counter orders, order board, and price catalog
    if (role === 'cashier') {
      return [
        {
          view: 'DASHBOARD',
          label: 'Tablero de Pedidos',
          icon: <LayoutDashboard className="w-4 h-4" />,
          badge: activeOrdersCount > 0 ? activeOrdersCount : undefined,
          badgeColor: 'bg-blue-500 text-white'
        },
        {
          view: 'ORDER_CREATE',
          label: '+ Nuevo Encargo',
          icon: <PlusCircle className="w-4 h-4 text-amber-400" />
        },
        {
          view: 'PRODUCTS_RECIPES',
          label: 'Catálogo & Precios',
          icon: <BookOpen className="w-4 h-4" />
        }
      ];
    }

    // Head Baker: Technical sheets, kitchen daily consolidation & oven batches, raw materials stock check
    if (role === 'head_baker') {
      return [
        {
          view: 'PRODUCTS_RECIPES',
          label: 'Fichas & Recetas',
          icon: <BookOpen className="w-4 h-4 text-amber-400" />
        },
        {
          view: 'KITCHEN_DAILY',
          label: 'Consolidado Cocina',
          icon: <ChefHat className="w-4 h-4" />,
          badge: blockedOrdersCount > 0 ? blockedOrdersCount : undefined,
          badgeColor: 'bg-red-500 text-white'
        },
        {
          view: 'RAW_MATERIALS',
          label: 'Insumos (Consulta)',
          icon: <Package className="w-4 h-4" />,
          badge: criticalMaterialsCount > 0 ? criticalMaterialsCount : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
        }
      ];
    }

    // Production Manager: Raw materials stock, kitchen daily & mass deduction, product formulas
    if (role === 'production_manager') {
      return [
        {
          view: 'RAW_MATERIALS',
          label: 'Materias Primas & Stock',
          icon: <Package className="w-4 h-4" />,
          badge: criticalMaterialsCount > 0 ? criticalMaterialsCount : undefined,
          badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
        },
        {
          view: 'KITCHEN_DAILY',
          label: 'Consolidado & Deducción',
          icon: <ChefHat className="w-4 h-4" />,
          badge: blockedOrdersCount > 0 ? blockedOrdersCount : undefined,
          badgeColor: 'bg-red-500 text-white'
        },
        {
          view: 'PRODUCTS_RECIPES',
          label: 'Fórmulas & Catálogo',
          icon: <BookOpen className="w-4 h-4" />
        }
      ];
    }

    // Admin: Full Access to all views
    return [
      {
        view: 'DASHBOARD',
        label: 'Panel Operativo',
        icon: <LayoutDashboard className="w-4 h-4" />
      },
      {
        view: 'ORDER_CREATE',
        label: '+ Nuevo Encargo',
        icon: <PlusCircle className="w-4 h-4 text-amber-400" />
      },
      {
        view: 'KITCHEN_DAILY',
        label: 'Consolidado Cocina',
        icon: <ChefHat className="w-4 h-4" />,
        badge: blockedOrdersCount > 0 ? blockedOrdersCount : undefined,
        badgeColor: 'bg-red-500 text-white'
      },
      {
        view: 'RAW_MATERIALS',
        label: 'Materias Primas',
        icon: <Package className="w-4 h-4" />,
        badge: criticalMaterialsCount > 0 ? criticalMaterialsCount : undefined,
        badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
      },
      {
        view: 'PRODUCTS_RECIPES',
        label: 'Catálogo & Recetas',
        icon: <BookOpen className="w-4 h-4" />
      },
      {
        view: 'SETTINGS',
        label: 'Configuración',
        icon: <Settings className="w-4 h-4" />
      }
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & System Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigateTo(currentUser ? getDefaultViewForRole(currentUser.role) : 'AUTH')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-bold">
              <Wheat className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-white">
                  MazaMadre <span className="text-amber-400">Control</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {currentUser?.role === 'customer' ? 'Área Clientes' : 'SaaS Obrador'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {currentUser?.role === 'customer'
                  ? 'Catálogo Artesano & Encargos de Masa Madre'
                  : 'Gestión Operativa, Fichas Técnicas & Inventario'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links - Shown only for authenticated users */}
          {currentUser ? (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = navigation.currentView === item.view;
                return (
                  <button
                    key={item.view}
                    onClick={() => navigateTo(item.view)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          ) : (
            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Acceso al Obrador — Inicie sesión para operar</span>
            </div>
          )}

          {/* User Profile / Auth State */}
          <div className="flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigateTo('AUTH')}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all text-left cursor-pointer"
                  title="Gestionar cuenta o cambiar de rol"
                >
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&q=80'}
                    alt={currentUser.full_name}
                    className="w-7 h-7 rounded-full object-cover border border-amber-500/40"
                  />
                  <div className="hidden md:block">
                    <span className="text-xs font-bold text-slate-200 block leading-tight">
                      {currentUser.full_name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-medium">
                      {ROLE_CAPABILITIES[currentUser.role]?.badgeLabel || currentUser.role}
                    </span>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigateTo('AUTH')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Scrollable Sub-bar - Only shown when authenticated */}
        {currentUser && (
          <div className="lg:hidden flex items-center gap-2 py-2 overflow-x-auto no-scrollbar border-t border-slate-800/80">
            {navItems.map((item) => {
              const isActive = navigation.currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => navigateTo(item.view)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
