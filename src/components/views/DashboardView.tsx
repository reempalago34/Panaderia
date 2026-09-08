import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Flame,
  Clock,
  ArrowRight,
  PlusCircle,
  ChefHat,
  Package,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  Phone,
  DollarSign
} from 'lucide-react';
import { OrderStatus } from '../../types';

export const DashboardView: React.FC = () => {
  const {
    orders,
    rawMaterials,
    settings,
    currentUser,
    navigateTo,
    restockRawMaterial,
    updateOrderStatus
  } = useApp();

  const isCashier = currentUser?.role === 'cashier';
  const canManageKitchen = currentUser?.role === 'admin' || currentUser?.role === 'head_baker' || currentUser?.role === 'production_manager';
  const canRestock = currentUser?.role === 'admin' || currentUser?.role === 'production_manager';

  const [restockingId, setRestockingId] = useState<string | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(25);

  // Financial & Operational Metrics
  const activeOrders = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const totalCollectedDeposits = orders.reduce((sum, o) => sum + o.deposit_amount, 0);
  const totalPendingBalance = activeOrders.reduce((sum, o) => sum + o.remaining_balance, 0);
  const criticalMaterials = rawMaterials.filter((m) => m.status === 'CRITICAL' || m.status === 'OUT_OF_STOCK');
  const blockedOrders = orders.filter((o) => o.status === 'BLOCKED_BY_INSUMOS');

  // Today's Date in YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.delivery_date.slice(0, 10) === todayStr && o.status !== 'CANCELLED');

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">Confirmado</span>;
      case 'IN_PRODUCTION':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">En Producción</span>;
      case 'READY':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Listo p/ Entrega</span>;
      case 'BLOCKED_BY_INSUMOS':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">Bloqueado x Insumos</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-700/50 text-slate-300">Entregado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-700 text-slate-300">{status}</span>;
    }
  };

  const handleQuickRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockingId && restockAmount > 0) {
      restockRawMaterial(restockingId, restockAmount);
      setRestockingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner with Operations Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1E293B] to-[#0F172A] border border-slate-700/70 p-6 rounded-2xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Obrador Activo · Hornadas en Marcha
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Panel de Control Operativo
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Monitoreo diario de pedidos por encargo, entregas y estado de inventario.
          </p>
        </div>

        {/* Quick CTA Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigateTo('ORDER_CREATE')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Nuevo Encargo (RF-01)</span>
          </button>

          {canManageKitchen ? (
            <button
              onClick={() => navigateTo('KITCHEN_DAILY')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <ChefHat className="w-4 h-4 text-amber-400" />
              <span>Consolidado de Cocina</span>
            </button>
          ) : (
            <button
              onClick={() => navigateTo('PRODUCTS_RECIPES')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <Package className="w-4 h-4 text-amber-400" />
              <span>Catálogo & Precios</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Alert Warning Bar (if any blocked orders) */}
      {blockedOrders.length > 0 && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start sm:items-center justify-between gap-3 text-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">¡Atención Operativa (RN-04)!</span> Hay{' '}
              <span className="font-bold underline">{blockedOrders.length} pedido(s) bloqueado(s)</span> por
              insuficiencia de materias primas en almacén.
            </div>
          </div>
          <button
            onClick={() => navigateTo('ORDER_DETAIL', blockedOrders[0].id)}
            className="px-3 py-1.5 rounded-lg bg-red-500 text-white font-bold text-xs hover:bg-red-600 shrink-0 cursor-pointer"
          >
            Ver Pedido Bloqueado
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Orders */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Pedidos en Curso</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-white">
              {activeOrders.length}
            </span>
            <span className="text-xs text-slate-400">órdenes activas</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
            <span>Hoy para entrega:</span>
            <span className="font-bold text-amber-400">{todayOrders.length} pedidos</span>
          </div>
        </div>

        {/* KPI 2: Deposits Collected (RN-01) */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Abonos Recaudados</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-emerald-400">
              {settings.currency_symbol}{totalCollectedDeposits.toFixed(2)}
            </span>
            <span className="text-xs text-emerald-500 font-semibold">Garantizado</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
            <span>Saldo pendiente entrega:</span>
            <span className="font-bold text-slate-200">{settings.currency_symbol}{totalPendingBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* KPI 3: Critical Raw Materials */}
        <div
          onClick={() => navigateTo('RAW_MATERIALS')}
          className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-2 cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Insumos en Alerta</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              criticalMaterials.length > 0 ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`font-heading text-3xl font-extrabold ${
              criticalMaterials.length > 0 ? 'text-red-400' : 'text-slate-200'
            }`}>
              {criticalMaterials.length}
            </span>
            <span className="text-xs text-slate-400">bajo stock mínimo</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-amber-400 pt-1 border-t border-slate-700/50">
            <span>Ver almacén e insumos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* KPI 4: Kitchen Daily Schedule */}
        <div
          onClick={() => navigateTo('KITCHEN_DAILY')}
          className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-2 cursor-pointer hover:border-amber-500/50 transition-colors"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Hornadas Diarias</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-amber-400">
              {todayOrders.filter((o) => o.status === 'IN_PRODUCTION' || o.status === 'READY').length}
            </span>
            <span className="text-xs text-slate-400">lotes programados</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-amber-400 pt-1 border-t border-slate-700/50">
            <span>Ir a explosión de recetas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Two-Column Section: Urgent Deliveries vs Critical Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Urgent Deliveries / Recent Orders (Col 7) */}
        <div className="lg:col-span-7 bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Entregas Urgentes & Pedidos Activos</span>
              </h2>
              <p className="text-xs text-slate-400">Listado de órdenes priorizadas por fecha y hora de entrega</p>
            </div>
            <button
              onClick={() => navigateTo('ORDER_CREATE')}
              className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>+ Nuevo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activeOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No hay pedidos activos en este momento.</p>
            ) : (
              activeOrders.slice(0, 5).map((order) => {
                const deliveryDate = new Date(order.delivery_date);
                const isToday = order.delivery_date.slice(0, 10) === todayStr;

                return (
                  <div
                    key={order.id}
                    onClick={() => navigateTo('ORDER_DETAIL', order.id)}
                    className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 hover:border-slate-600 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {order.order_number}
                        </span>
                        {getStatusBadge(order.status)}
                        {isToday && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            HOY
                          </span>
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-white">
                        {order.customer_name}
                      </h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-2">
                        <span>Entrega: {deliveryDate.toLocaleDateString()} a las {deliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span>·</span>
                        <span className="capitalize text-slate-300">{order.payment_method}</span>
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                      <div className="text-right">
                        <span className="text-xs font-bold text-white block">
                          Total: {settings.currency_symbol}{order.total_amount.toFixed(2)}
                        </span>
                        <span className="text-[11px] text-amber-400 font-semibold">
                          Resta: {settings.currency_symbol}{order.remaining_balance.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 hover:text-white">
                        Ver Comanda <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Critical Stock Alerts (Col 5) */}
        <div className="lg:col-span-5 bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div>
              <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <Package className="w-4 h-4 text-red-400" />
                <span>Alertas de Stock Crítico</span>
              </h2>
              <p className="text-xs text-slate-400">Insumos que requieren reabastecimiento inmediato</p>
            </div>
            {canRestock && (
              <button
                onClick={() => navigateTo('RAW_MATERIALS')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Todo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-3">
            {criticalMaterials.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/50 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold text-slate-200">¡Inventario en Óptimas Condiciones!</p>
                <p className="text-[11px] text-slate-400">Todos los insumos superan los umbrales mínimos.</p>
              </div>
            ) : (
              criticalMaterials.map((mat) => {
                const stockPercent = Math.min(100, Math.round((mat.current_stock / mat.minimum_stock) * 100));
                return (
                  <div
                    key={mat.id}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-400">{mat.sku}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${
                            mat.status === 'OUT_OF_STOCK'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}>
                            {mat.status === 'OUT_OF_STOCK' ? 'AGOTADO' : 'CRÍTICO'}
                          </span>
                        </div>
                        <h3 className="text-xs font-bold text-white mt-0.5">{mat.name}</h3>
                      </div>

                      {canRestock && (
                        <button
                          onClick={() => {
                            setRestockingId(mat.id);
                            setRestockAmount(mat.minimum_stock * 2);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-[11px] border border-amber-500/30 transition-all cursor-pointer shrink-0"
                        >
                          + Reabastecer
                        </button>
                      )}
                    </div>

                    {/* Stock Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>
                          Actual: <strong className="text-white">{mat.current_stock} {mat.unit}</strong>
                        </span>
                        <span>Mínimo: {mat.minimum_stock} {mat.unit}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            mat.status === 'OUT_OF_STOCK' ? 'bg-red-500' : 'bg-amber-400'
                          }`}
                          style={{ width: `${stockPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Quick Restock Modal */}
      {restockingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>Reabastecimiento Rápido de Insumo</span>
            </h3>

            {(() => {
              const mat = rawMaterials.find((m) => m.id === restockingId);
              if (!mat) return null;
              return (
                <form onSubmit={handleQuickRestockSubmit} className="space-y-4">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400 block">Insumo a ingresar:</span>
                    <span className="font-bold text-white block text-sm">{mat.name}</span>
                    <span className="text-[11px] text-slate-400">Proveedor: {mat.supplier}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Cantidad a Ingresar ({mat.unit})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={restockAmount}
                      onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-amber-400"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRestockingId(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                    >
                      Confirmar Entrada al Almacén
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
