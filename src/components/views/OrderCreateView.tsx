import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PaymentMethod } from '../../types';
import {
  PlusCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  User,
  ShoppingBag,
  Trash2,
  Calendar,
  ShieldAlert,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export const OrderCreateView: React.FC = () => {
  const { currentUser, products, settings, createOrder, navigateTo, showToast } = useApp();

  const isCustomer = currentUser?.role === 'customer';
  const isHeadBaker = currentUser?.role === 'head_baker';

  // Step 1: Customer Data (Autofilled from verified session if customer)
  const [customerName, setCustomerName] = useState(() => (isCustomer ? currentUser?.full_name || '' : ''));
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState(() => (isCustomer ? currentUser?.email || '' : ''));
  const [notes, setNotes] = useState('');

  // Step 2: Date & Time (RN-02 default: tomorrow at 11:00)
  const defaultDelivery = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(11, 0, 0, 0);
    // Format YYYY-MM-DDTHH:mm
    return d.toISOString().slice(0, 16);
  })();

  const [deliveryDate, setDeliveryDate] = useState(defaultDelivery);

  // Step 3: Selected Items [{ product_id, quantity }]
  const [selectedItems, setSelectedItems] = useState<Array<{ product_id: string; quantity: number }>>([
    { product_id: products[0]?.id || '', quantity: 2 }
  ]);

  // Step 4: Deposit & Payment Method (RN-01)
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bizum');
  const [isAutoCalculatedDeposit, setIsAutoCalculatedDeposit] = useState(true);

  // Totals Calculation
  const totalAmount = selectedItems.reduce((sum, itm) => {
    const prod = products.find((p) => p.id === itm.product_id);
    return sum + (prod ? prod.price * itm.quantity : 0);
  }, 0);

  const minRequiredDeposit = Number((totalAmount * (settings.minimum_deposit_percentage / 100)).toFixed(2));

  // Auto-sync deposit if user hasn't typed custom
  React.useEffect(() => {
    if (isAutoCalculatedDeposit && totalAmount > 0) {
      setDepositAmount(minRequiredDeposit);
    }
  }, [totalAmount, isAutoCalculatedDeposit, minRequiredDeposit]);

  // RN-01 Check: Deposit >= 50%
  const isDepositValid = depositAmount >= minRequiredDeposit - 0.01 && depositAmount <= totalAmount + 0.01;

  // RN-02 Check: Hours difference >= 24h
  const now = new Date();
  const deliveryTime = new Date(deliveryDate).getTime();
  const hoursAhead = (deliveryTime - now.getTime()) / (1000 * 60 * 60);
  const isAdvanceTimeValid = hoursAhead >= settings.minimum_advance_hours - 0.05;

  const remainingBalance = Math.max(0, Number((totalAmount - depositAmount).toFixed(2)));

  const handleAddItemRow = () => {
    const nextProd = products.find((p) => !selectedItems.some((s) => s.product_id === p.id)) || products[0];
    if (nextProd) {
      setSelectedItems((prev) => [...prev, { product_id: nextProd.id, quantity: 1 }]);
    }
  };

  const handleRemoveItemRow = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdvanceTimeValid) {
      showToast(
        `[RN-02] Antelación insuficiente: se requiere un mínimo de ${settings.minimum_advance_hours} horas para la fermentación de las masas.`,
        'error'
      );
      return;
    }

    if (!isDepositValid) {
      showToast(
        `[RN-01] Abono inválido: El abono mínimo obligatorio es del ${settings.minimum_deposit_percentage}% (${settings.currency_symbol}${minRequiredDeposit.toFixed(2)}).`,
        'error'
      );
      return;
    }

    if (selectedItems.length === 0) {
      showToast('Debe seleccionar al menos un producto.', 'warning');
      return;
    }

    const result = createOrder(
      {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        delivery_date: new Date(deliveryDate).toISOString(),
        total_amount: totalAmount,
        deposit_amount: depositAmount,
        payment_method: paymentMethod,
        notes: notes
      },
      selectedItems
    );

    if (result.success && result.order) {
      navigateTo('ORDER_DETAIL', result.order.id);
    }
  };

  if (isHeadBaker) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 bg-red-500/15 border border-red-500/30 rounded-2xl space-y-3">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Área de Venta y Pedidos</h2>
          <p className="text-xs text-slate-300">
            La creación de comandas está delegada a atención al cliente, cajeros o clientes en línea. Como maestro panadero, su área de trabajo es el obrador y horneado.
          </p>
          <button
            onClick={() => navigateTo('KITCHEN_DAILY')}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Ir a Consolidado de Cocina
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{isCustomer ? 'Encargo de Panadería Artesanal' : 'Wizard de Registro de Pedidos por Encargo (RF-01)'}</span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
          {isCustomer ? 'Realizar Encargo Online' : 'Nuevo Pedido por Encargo'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          {isCustomer
            ? 'Todos nuestros panes fermentan de 24 a 48 horas. Reserva tus piezas artesanales con abono previo garantizado.'
            : 'Validación estricta de abono previo (RN-01 >= 50%) y antelación mínima para fermentación (RN-02 >= 24h).'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Customer Info */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="font-heading text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <User className="w-4 h-4 text-amber-400" />
            <span>1. Datos del Cliente & Contacto {isCustomer && '(Sesión Verificada)'}</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                disabled={isCustomer}
                placeholder="ej. Marc Rodríguez"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-400 ${
                  isCustomer ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Teléfono de Contacto *
              </label>
              <input
                type="tel"
                required
                placeholder="ej. +34 622 334 455"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email para Confirmación
              </label>
              <input
                type="email"
                disabled={isCustomer}
                placeholder="cliente@correo.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-400 ${
                  isCustomer ? 'opacity-80 cursor-not-allowed' : ''
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notas Especiales / Dedicatoria / Rebanado
            </label>
            <textarea
              rows={2}
              placeholder="ej. Rebanar la hogaza fino (10mm). En la tarta poner dedicatoria de chocolate: 'Felicidades Ana'."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-400"
            />
          </div>
        </div>

        {/* Section 2: Products Selection */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h2 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>2. Selección de Productos del Obrador</span>
            </h2>
            <button
              type="button"
              onClick={handleAddItemRow}
              className="px-3 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-xs border border-amber-500/30 transition-colors cursor-pointer"
            >
              + Añadir Producto
            </button>
          </div>

          <div className="space-y-3">
            {selectedItems.map((item, idx) => {
              const prod = products.find((p) => p.id === item.product_id);
              const rowSubtotal = prod ? prod.price * item.quantity : 0;

              return (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <select
                    value={item.product_id}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setSelectedItems((prev) =>
                        prev.map((it, i) => (i === idx ? { ...it, product_id: newId } : it))
                      );
                    }}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {settings.currency_symbol}{p.price.toFixed(2)} ({p.portions_or_weight})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Cantidad:</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={item.quantity}
                        onChange={(e) => {
                          const q = parseInt(e.target.value, 10) || 1;
                          setSelectedItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, quantity: q } : it))
                          );
                        }}
                        className="w-16 px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white text-center font-bold"
                      />
                    </div>

                    <div className="w-24 text-right">
                      <span className="font-heading font-bold text-sm text-amber-300">
                        {settings.currency_symbol}{rowSubtotal.toFixed(2)}
                      </span>
                    </div>

                    {selectedItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="p-1.5 text-red-400 hover:text-red-300"
                        title="Quitar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-700">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Bruto del Pedido:
            </span>
            <span className="font-heading font-extrabold text-2xl text-white">
              {settings.currency_symbol}{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Section 3: Delivery Date & RN-02 Check */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="font-heading text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>3. Fecha & Hora de Entrega (Regla de Negocio RN-02)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Fecha y Hora de Entrega Solicitada *
              </label>
              <input
                type="datetime-local"
                required
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-xs text-white ${
                  isAdvanceTimeValid ? 'border-slate-700' : 'border-red-500 ring-1 ring-red-500/50'
                }`}
              />
            </div>

            {/* Live RN-02 Status Box */}
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                isAdvanceTimeValid
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-300'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {isAdvanceTimeValid ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>RN-02 Cumplida: {hoursAhead.toFixed(1)}h de antelación</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                    <span>RN-02 Violada: Solo {hoursAhead.toFixed(1)}h de antelación</span>
                  </>
                )}
              </div>
              <p className="text-[11px] opacity-90">
                Se exigen al menos {settings.minimum_advance_hours} horas para respetar la fermentación en frío del obrador.
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Deposit & RN-01 Check */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-5">
          <h2 className="font-heading text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>4. Abono Mínimo Obligatorio (Regla de Negocio RN-01)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Minimum Required (50%) */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Abono Mínimo ({settings.minimum_deposit_percentage}%)
              </span>
              <span className="font-heading font-extrabold text-xl text-amber-400">
                {settings.currency_symbol}{minRequiredDeposit.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block">Requerido por política</span>
            </div>

            {/* Deposit Input Field */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block">
                Abono Ingresado ({settings.currency_symbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={depositAmount}
                onChange={(e) => {
                  setIsAutoCalculatedDeposit(false);
                  setDepositAmount(parseFloat(e.target.value) || 0);
                }}
                className={`w-full px-3 py-1.5 rounded-lg bg-slate-800 border text-base font-bold text-white ${
                  isDepositValid ? 'border-emerald-500' : 'border-red-500 ring-1 ring-red-500/50'
                }`}
              />
              <span className={`text-[10px] font-bold block ${isDepositValid ? 'text-emerald-400' : 'text-red-400'}`}>
                {isDepositValid ? '✓ Abono suficiente' : `⚠️ Mínimo: ${settings.currency_symbol}${minRequiredDeposit.toFixed(2)}`}
              </span>
            </div>

            {/* Remaining Balance */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Saldo Restante a la Entrega
              </span>
              <span className="font-heading font-extrabold text-xl text-slate-200">
                {settings.currency_symbol}{remainingBalance.toFixed(2)}
              </span>
              <span className="text-[10px] text-slate-500 block">A cobrar en mostrador</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Método de Pago del Abono Recibido *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['bizum', 'tarjeta', 'efectivo', 'transferencia'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button with Validation State */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigateTo('DASHBOARD')}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
          >
            Cancelar y Volver
          </button>

          <button
            type="submit"
            disabled={!isAdvanceTimeValid || !isDepositValid}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-xl transition-all ${
              isAdvanceTimeValid && isDepositValid
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 active:scale-95 cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirmar y Generar Pedido por Encargo</span>
          </button>
        </div>
      </form>
    </div>
  );
};
