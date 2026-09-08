import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Package,
  Clock,
  Printer,
  DollarSign,
  Phone,
  Mail,
  User,
  ShoppingBag,
  Layers,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

export const OrderDetailView: React.FC = () => {
  const {
    navigation,
    navigateTo,
    currentUser,
    orders,
    orderItems,
    products,
    settings,
    updateOrderStatus,
    processOrderProduction,
    recordOrderPayment,
    getRecipeExplosionForOrder
  } = useApp();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [additionalPayment, setAdditionalPayment] = useState<number>(0);

  const isCustomer = currentUser?.role === 'customer';
  const isCashier = currentUser?.role === 'cashier';
  const isHeadBaker = currentUser?.role === 'head_baker';
  const isProdManager = currentUser?.role === 'production_manager';
  const isAdmin = currentUser?.role === 'admin';

  const orderId = navigation.selectedItemId || orders[0]?.id;
  const order = orders.find((o) => o.id === orderId);

  // If customer, verify identity to prevent viewing other customers' private orders
  const isOrderBelongingToCustomer =
    !isCustomer ||
    (order && (
      order.customer_email.toLowerCase() === currentUser?.email.toLowerCase() ||
      order.customer_name.toLowerCase() === currentUser?.full_name.toLowerCase()
    ));

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Pedido no encontrado</h2>
        <button
          onClick={() => navigateTo(isCustomer ? 'PRODUCTS_RECIPES' : 'DASHBOARD')}
          className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
        >
          {isCustomer ? 'Ir al Catálogo' : 'Volver al Panel'}
        </button>
      </div>
    );
  }

  if (isCustomer && !isOrderBelongingToCustomer) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 bg-red-500/15 border border-red-500/30 rounded-2xl space-y-3">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Privacidad y Protección de Datos</h2>
          <p className="text-xs text-slate-300">
            Por estrictas políticas de privacidad, los clientes solo tienen acceso a consultar y gestionar sus propios encargos personales.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigateTo('PRODUCTS_RECIPES')}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
            >
              Volver a Mis Encargos & Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const items = orderItems.filter((oi) => oi.order_id === order.id);
  const explosion = getRecipeExplosionForOrder(order.id);
  const missingItems = explosion.filter((e) => !e.is_sufficient);
  const deliveryDate = new Date(order.delivery_date);
  const createdDate = new Date(order.created_at);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">Confirmado con Abono</span>;
      case 'IN_PRODUCTION':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">En Producción (Obrador)</span>;
      case 'READY':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">Listo para Entrega</span>;
      case 'BLOCKED_BY_INSUMOS':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">Bloqueado por Insumos (RN-04)</span>;
      case 'DELIVERED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700/60 text-slate-300 border border-slate-600">Entregado al Cliente</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700 text-slate-300">{status}</span>;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (additionalPayment > 0) {
      recordOrderPayment(order.id, additionalPayment);
      setPaymentModalOpen(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigateTo(isCustomer ? 'PRODUCTS_RECIPES' : 'DASHBOARD')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isCustomer ? 'Volver al Catálogo & Mis Encargos' : 'Volver al Panel Operativo'}</span>
        </button>

        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-amber-400" />
          <span>{isCustomer ? 'Descargar / Imprimir Comprobante' : 'Imprimir Comanda del Taller'}</span>
        </button>
      </div>

      {/* Main Order Header Card */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-700/70 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-heading font-extrabold text-2xl text-white">
                {order.order_number}
              </span>
              {getStatusBadge(order.status)}
            </div>
            <p className="text-xs text-slate-400">
              Registrado el {createdDate.toLocaleDateString()} a las {createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">Fecha y Hora de Recogida:</span>
            <span className="font-heading font-bold text-base text-amber-400 block">
              {deliveryDate.toLocaleDateString()} · {deliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Customer View: Progress Tracker */}
        {isCustomer && (
          <div className="pt-2">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">Seguimiento de tu Encargo Artesanal:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className={`p-2 rounded-lg border ${
                  order.status !== 'CANCELLED' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold' : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  1. Abono Confirmado
                </div>
                <div className={`p-2 rounded-lg border ${
                  order.status === 'IN_PRODUCTION' || order.status === 'READY' || order.status === 'DELIVERED'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  2. En el Obrador (24h)
                </div>
                <div className={`p-2 rounded-lg border ${
                  order.status === 'READY' || order.status === 'DELIVERED'
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  3. Listo en Mostrador
                </div>
                <div className={`p-2 rounded-lg border ${
                  order.status === 'DELIVERED'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}>
                  4. Recogido
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Presenta este comprobante o tu nombre al acercarte a la panadería en la fecha y hora seleccionadas.
              </p>
            </div>
          </div>
        )}

        {/* Staff / Admin Action Controls Stepper */}
        {!isCustomer && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {(isAdmin || isHeadBaker || isProdManager) && order.status === 'CONFIRMED' && (
              <button
                onClick={() => processOrderProduction(order.id)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
              >
                <Flame className="w-4 h-4" />
                <span>Deducir Insumos & Iniciar Hornada (RN-03)</span>
              </button>
            )}

            {(isAdmin || isHeadBaker || isProdManager) && order.status === 'BLOCKED_BY_INSUMOS' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => processOrderProduction(order.id)}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  <span>Reintentar Deducción de Insumos</span>
                </button>
                {(isAdmin || isProdManager) && (
                  <button
                    onClick={() => navigateTo('RAW_MATERIALS')}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Ir al Almacén a Reabastecer</span>
                  </button>
                )}
              </div>
            )}

            {(isAdmin || isHeadBaker || isProdManager) && order.status === 'IN_PRODUCTION' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'READY')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Marcar como Listo para Entrega</span>
              </button>
            )}

            {(isAdmin || isCashier) && order.status === 'READY' && (
              <button
                onClick={() => {
                  if (order.remaining_balance > 0) {
                    setAdditionalPayment(order.remaining_balance);
                    setPaymentModalOpen(true);
                  } else {
                    updateOrderStatus(order.id, 'DELIVERED');
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {order.remaining_balance > 0 ? 'Cobrar Saldo Restante y Entregar' : 'Entregar al Cliente'}
                </span>
              </button>
            )}

            {isAdmin && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
              <button
                onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-red-500/20 hover:text-red-300 text-slate-400 text-xs font-semibold ml-auto transition-colors cursor-pointer"
              >
                Cancelar Pedido
              </button>
            )}
          </div>
        )}
      </div>

      {/* Blocked Alert Banner (RN-04) - Only for staff who manage materials */}
      {!isCustomer && order.status === 'BLOCKED_BY_INSUMOS' && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-red-300">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>Bloqueo Preventivo Activo (Regla de Negocio RN-04)</span>
          </div>
          <p className="text-xs text-red-200">
            {order.blocked_reason || 'El pedido no puede pasar a producción debido a insuficiencia en el stock de insumos requeridos en la ficha técnica.'}
          </p>
          {(isAdmin || isProdManager) && (
            <div className="pt-1">
              <button
                onClick={() => navigateTo('RAW_MATERIALS')}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer"
              >
                Haga clic aquí para ir al Almacén de Insumos y reabastecer las materias primas faltantes &rarr;
              </button>
            </div>
          )}
        </div>
      )}

      {/* Customer & Financial Breakdown 2-Col Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info Card */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>{isHeadBaker ? 'Datos para Comanda y Etiqueta' : 'Información del Cliente'}</span>
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Nombre de Recogida:</span>
              <span className="font-bold text-slate-100">{order.customer_name}</span>
            </div>

            {/* Protect personal phone & email from baker; show to customer, cashier, and admin */}
            {!isHeadBaker && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-400">Teléfono de Contacto:</span>
                  <span className="font-mono text-slate-200 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {order.customer_phone}
                  </span>
                </div>
                {order.customer_email && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-200">{order.customer_email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-400">Método de Pago:</span>
                  <span className="capitalize font-bold text-amber-400">{order.payment_method}</span>
                </div>
              </>
            )}

            {order.notes && (
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-slate-300 mt-2">
                <span className="font-bold text-amber-400 block mb-0.5">Instrucciones Especiales del Pedido:</span>
                {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Financial Balance Card - Only visible to customer, cashier, admin (baker doesn't handle money) */}
        {!isHeadBaker && (
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>{isCustomer ? 'Resumen de Pago' : 'Balance Financiero (RN-01)'}</span>
              </h3>
              {(isAdmin || isCashier) && order.remaining_balance > 0 && (
                <button
                  onClick={() => {
                    setAdditionalPayment(order.remaining_balance);
                    setPaymentModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 font-bold text-[11px] border border-emerald-500/30 transition-colors cursor-pointer"
                >
                  + Asentar Pago
                </button>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total del Pedido:</span>
                <span className="font-bold text-white text-sm">
                  {settings.currency_symbol}{order.total_amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Abono Inicial Recibido:</span>
                <span className="font-bold text-emerald-400">
                  {settings.currency_symbol}{order.deposit_amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-700/60">
                <span className="text-slate-300 font-bold">Saldo Pendiente de Cobro:</span>
                <span className={`font-heading font-extrabold text-base ${
                  order.remaining_balance > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {settings.currency_symbol}{order.remaining_balance.toFixed(2)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 pt-1">
                {order.remaining_balance === 0
                  ? '✓ Pedido totalmente liquidado.'
                  : 'A liquidar en el mostrador durante la recogida del pedido.'}
              </p>
            </div>
          </div>
        )}

        {/* If Baker: show Workshop Baking Schedule Card */}
        {isHeadBaker && (
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Instrucciones de Cocción & Horneado</span>
            </h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 block">Horario de Horno:</span>
                <p className="text-slate-300">
                  Cargar al horno de solera de piedra a primera hora de la mañana para entrega a las {deliveryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                </p>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">Total unidades a hornear:</span>
                <span className="font-bold text-white">
                  {items.reduce((s, it) => s + it.quantity, 0)} piezas
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ordered Products Table */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-2">
          <ShoppingBag className="w-4 h-4 text-amber-400" />
          <span>{isCustomer ? 'Productos de tu Encargo' : 'Productos Solicitados en esta Orden'}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-2 px-3">Producto</th>
                <th className="py-2 px-3">Cantidad</th>
                <th className="py-2 px-3">Precio Unitario</th>
                <th className="py-2 px-3 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {items.map((it) => {
                const prod = products.find((p) => p.id === it.product_id);
                return (
                  <tr key={it.id}>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-200 block">
                        {prod ? prod.name : 'Producto'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {prod?.sku} · {prod?.portions_or_weight}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {it.quantity} ud
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {settings.currency_symbol}{it.unit_price.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-amber-300">
                      {settings.currency_symbol}{it.subtotal.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recipe Explosion for this Order - STRICTLY CONFIDENTIAL FOR OBRADOR/ADMIN */}
      {(isAdmin || isHeadBaker || isProdManager) && (
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h3 className="font-heading text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Explosión de Materias Primas Requeridas (Ficha Técnica)</span>
            </h3>
            <span className="text-[11px] text-slate-400">
              {missingItems.length === 0 ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Stock suficiente en almacén
                </span>
              ) : (
                <span className="text-red-400 font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {missingItems.length} insumo(s) con déficit
                </span>
              )}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-2 px-3">Insumo</th>
                  <th className="py-2 px-3">Cantidad Requerida</th>
                  <th className="py-2 px-3">Stock Actual Almacén</th>
                  <th className="py-2 px-3">Déficit</th>
                  <th className="py-2 px-3 text-right">Disponibilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {explosion.map((exp) => (
                  <tr key={exp.raw_material.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">
                      {exp.raw_material.name}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-amber-300">
                      {exp.required_quantity} {exp.raw_material.unit}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {exp.current_stock} {exp.raw_material.unit}
                    </td>
                    <td className="py-2.5 px-3">
                      {exp.deficit > 0 ? (
                        <span className="font-bold text-red-400">
                          -{exp.deficit} {exp.raw_material.unit}
                        </span>
                      ) : (
                        <span className="text-slate-500">0.00</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {exp.is_sufficient ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Disponible
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                          Insuficiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Registrar Cobro de Saldo</span>
            </h3>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 block">Comanda: {order.order_number}</span>
                <span className="font-bold text-white block">{order.customer_name}</span>
                <span className="text-amber-400 block font-semibold">
                  Saldo pendiente actual: {settings.currency_symbol}{order.remaining_balance.toFixed(2)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Monto Cobrado en Mostrador ({settings.currency_symbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={additionalPayment}
                  onChange={(e) => setAdditionalPayment(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white font-bold text-emerald-400 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  Asentar en Comanda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
