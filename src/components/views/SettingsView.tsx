import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { testSupabaseConnection } from '../../services/supabase';
import {
  Settings,
  Database,
  Sliders,
  Store,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Zap,
  ShieldAlert
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, navigateTo, settings, updateSettings, resetToDemoData, showToast } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  const [formData, setFormData] = useState({
    business_name: settings.business_name,
    tax_id: settings.tax_id,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    minimum_deposit_percentage: settings.minimum_deposit_percentage,
    minimum_advance_hours: settings.minimum_advance_hours,
    currency_symbol: settings.currency_symbol,
    supabase_url: settings.supabase_url,
    supabase_anon_key: settings.supabase_anon_key
  });

  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
  } | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  const handleTestSupabase = async () => {
    setTestingConnection(true);
    setConnectionStatus(null);

    const result = await testSupabaseConnection(formData.supabase_url, formData.supabase_anon_key);
    setConnectionStatus({
      tested: true,
      success: result.success,
      message: result.message
    });
    setTestingConnection(false);

    showToast(result.message, result.success ? 'success' : 'error');
  };

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 bg-red-500/15 border border-red-500/30 rounded-2xl space-y-3">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Acceso Restringido</h2>
          <p className="text-xs text-slate-300">
            La configuración empresarial, políticas financieras y credenciales del sistema son de acceso exclusivo para el Administrador General.
          </p>
          <button
            onClick={() => navigateTo(currentUser?.role === 'customer' ? 'PRODUCTS_RECIPES' : 'DASHBOARD')}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer"
          >
            Volver a mi área de trabajo
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
          <Settings className="w-3.5 h-3.5" />
          <span>Configuración & Reglas de Negocio (SCR-06)</span>
        </div>
        <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
          Ajustes del Sistema & Parámetros
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Modifique los parámetros operativos de las reglas de negocio (RN-01, RN-02) y la conexión Supabase.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        {/* Section 1: Business Rules (RN-01 & RN-02) */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="font-heading text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>1. Parámetros de Reglas de Negocio (RN-01 & RN-02)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Abono Mínimo Obligatorio (% RN-01) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.minimum_deposit_percentage}
                  onChange={(e) =>
                    setFormData({ ...formData, minimum_deposit_percentage: parseInt(e.target.value, 10) || 50 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold text-amber-300"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">%</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Por defecto 50% según directiva.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Antelación Mínima (Horas RN-02) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="168"
                  required
                  value={formData.minimum_advance_hours}
                  onChange={(e) =>
                    setFormData({ ...formData, minimum_advance_hours: parseInt(e.target.value, 10) || 24 })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold text-amber-300"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">horas</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Mínimo 24 horas para fermentación.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Símbolo de Moneda *
              </label>
              <input
                type="text"
                required
                value={formData.currency_symbol}
                onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white text-center font-bold"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Moneda del obrador (€, $, etc.)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Bakery Profile & Commercial Details */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="font-heading text-base font-bold text-white flex items-center gap-2 border-b border-slate-700 pb-3">
            <Store className="w-4 h-4 text-amber-400" />
            <span>2. Datos Comerciales del Obrador</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Comercial</label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">CIF / Tax ID</label>
              <input
                type="text"
                value={formData.tax_id}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección Física</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Supabase Backend Integration */}
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h2 className="font-heading text-base font-bold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              <span>3. Integración Supabase / PostgreSQL</span>
            </h2>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" /> RLS Activo
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={formData.supabase_url}
                onChange={(e) => setFormData({ ...formData, supabase_url: e.target.value })}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Supabase Anon Public API Key
              </label>
              <input
                type="password"
                value={formData.supabase_anon_key}
                onChange={(e) => setFormData({ ...formData, supabase_anon_key: e.target.value })}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={testingConnection}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{testingConnection ? 'Probando Conexión...' : 'Probar Conexión Supabase'}</span>
              </button>

              {connectionStatus && (
                <div
                  className={`text-xs flex items-center gap-1.5 font-semibold ${
                    connectionStatus.success ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {connectionStatus.success ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>{connectionStatus.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Desea restablecer todos los insumos, productos, pedidos y recetas de demostración del taller?')) {
                resetToDemoData();
              }
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer Datos Demo del Taller</span>
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-heading font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
};
