import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ChefHat,
  Flame,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Package,
  ShoppingBag,
  ArrowRight,
  Clock,
  Printer,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const KitchenDailyView: React.FC = () => {
  const {
    currentUser,
    orders,
    orderItems,
    products,
    rawMaterials,
    getRecipeExplosionForDate,
    processDailyKitchenProduction,
    navigateTo,
    settings
  } = useApp();

  const isAuthorized =
    currentUser?.role === 'admin' ||
    currentUser?.role === 'head_baker' ||
    currentUser?.role === 'production_manager';

  // Selected Production Date (default today)
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Calculate day-specific orders
  const dayOrders = orders.filter(
    (o) =>
      o.delivery_date.slice(0, 10) === selectedDate &&
      o.status !== 'CANCELLED'
  );

  const pendingProductionOrders = dayOrders.filter(
    (o) => o.status === 'CONFIRMED' || o.status === 'BLOCKED_BY_INSUMOS'
  );

  // Grouped Product Totals for baking
  const productTotalsMap = new Map<string, { product_id: string; quantity: number }>();

  dayOrders.forEach((ord) => {
    const items = orderItems.filter((oi) => oi.order_id === ord.id);
    items.forEach((it) => {
      const existing = productTotalsMap.get(it.product_id);
      if (existing) {
        existing.quantity += it.quantity;
      } else {
        productTotalsMap.set(it.product_id, { product_id: it.product_id, quantity: it.quantity });
      }
    });
  });

  const aggregatedProducts = Array.from(productTotalsMap.values()).map((p) => ({
    product: products.find((prod) => prod.id === p.product_id),
    totalQuantity: p.quantity
  })).filter((ap) => ap.product !== undefined);

  const totalPiecesToBake = aggregatedProducts.reduce((sum, p) => sum + p.totalQuantity, 0);

  // Consolidated Raw Materials Explosion for this Date
  const dailyExplosion = getRecipeExplosionForDate(selectedDate);
  const dailyMissing = dailyExplosion.filter((e) => !e.is_sufficient);

  const handleSetQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().slice(0, 10));
  };

  const handleTriggerProduction = () => {
    processDailyKitchenProduction(selectedDate);
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 bg-red-500/15 border border-red-500/30 rounded-2xl space-y-3">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Acceso Restringido</h2>
          <p className="text-xs text-slate-300">
            El consolidado de producción de obrador y control de hornadas es exclusivo para el equipo de panadería y administración.
          </p>
          <button
            onClick={() => navigateTo(currentUser?.role === 'customer' ? 'PRODUCTS_RECIPES' : 'DASHBOARD')}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Volver a mi área de trabajo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-2">
            <ChefHat className="w-3.5 h-3.5" />
            <span>Planificación y Consolidado de Cocina (SCR-07)</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
            Consolidado Diario de Obrador
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Agrupación de lotes para horneado y deducción masiva de materias primas (RN-03 y RN-04).
          </p>
        </div>

        {/* Date Selector Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => handleSetQuickDate(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedDate === new Date().toISOString().slice(0, 10)
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => handleSetQuickDate(1)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              Mañana
            </button>
          </div>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-400"
          />

          <button
            onClick={() => window.print()}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title="Imprimir hoja de producción"
          >
            <Printer className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Daily Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pedidos del Día
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-white">
              {dayOrders.length}
            </span>
            <span className="text-xs text-slate-400">órdenes programadas</span>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Piezas a Hornear
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-amber-400">
              {totalPiecesToBake}
            </span>
            <span className="text-xs text-slate-400">unidades totales</span>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pendientes de Hornada
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-blue-400">
              {pendingProductionOrders.length}
            </span>
            <span className="text-xs text-slate-400">órdenes sin pasar al obrador</span>
          </div>
        </div>

        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Insumos con Déficit
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`font-heading text-3xl font-extrabold ${dailyMissing.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {dailyMissing.length}
            </span>
            <span className="text-xs text-slate-400">materias primas faltantes</span>
          </div>
        </div>
      </div>

      {/* Production Trigger Action Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#1E293B] via-slate-900 to-[#1E293B] border border-amber-500/40 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <Flame className="w-5 h-5" />
            <span>Ejecución de Hornadas Diarias (RN-03 y RN-04)</span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Valida disponibilidad en almacén y descuenta automáticamente las recetas de todos los pedidos de la fecha ({selectedDate}). Si algún insumo falta, se aplica bloqueo preventivo.
          </p>
        </div>

        <button
          onClick={handleTriggerProduction}
          disabled={pendingProductionOrders.length === 0}
          className={`px-6 py-3.5 rounded-xl font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-xl transition-all ${
            pendingProductionOrders.length > 0
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20 active:scale-95 cursor-pointer'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>Deducir Insumos & Iniciar Jornada</span>
        </button>
      </div>

      {/* Two Column Layout: Products to Bake vs Raw Materials Needed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Products Consolidated (Col 5) */}
        <div className="lg:col-span-5 bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="font-heading text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Consolidado de Productos por Hornear</span>
          </h2>

          <div className="space-y-2.5">
            {aggregatedProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No hay productos programados para esta fecha.
              </p>
            ) : (
              aggregatedProducts.map((ap) => (
                <div
                  key={ap.product?.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={ap.product?.image_url}
                      alt={ap.product?.name}
                      className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {ap.product?.name}
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        {ap.product?.portions_or_weight} · {ap.product?.preparation_time_hours}h fermentación
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-heading font-extrabold text-lg text-amber-400">
                      {ap.totalQuantity} ud
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Raw Materials Consolidated Explosion (Col 7) */}
        <div className="lg:col-span-7 bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h2 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Explosión Consolidada de Materias Primas (Jornada)</span>
            </h2>
            <span className="text-[11px] text-slate-400">
              {dailyMissing.length === 0 ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Stock suficiente
                </span>
              ) : (
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Déficit detectado
                </span>
              )}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Materia Prima</th>
                  <th className="py-2.5 px-3">Total Requerido</th>
                  <th className="py-2.5 px-3">Stock en Almacén</th>
                  <th className="py-2.5 px-3">Déficit</th>
                  <th className="py-2.5 px-3 text-right">Disponibilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dailyExplosion.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No se requieren insumos para las órdenes de esta fecha.
                    </td>
                  </tr>
                ) : (
                  dailyExplosion.map((item) => (
                    <tr key={item.raw_material.id}>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {item.raw_material.name}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                        {item.required_quantity} {item.raw_material.unit}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {item.current_stock} {item.raw_material.unit}
                      </td>
                      <td className="py-2.5 px-3">
                        {item.deficit > 0 ? (
                          <span className="font-bold text-red-400">
                            -{item.deficit} {item.raw_material.unit}
                          </span>
                        ) : (
                          <span className="text-slate-500">0.00</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {item.is_sufficient ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Disponible
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                            Faltante
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
