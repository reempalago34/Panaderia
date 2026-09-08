import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RawMaterial, RawMaterialCategory, RawMaterialUnit, StockStatus } from '../../types';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit3,
  RefreshCw,
  X,
  Layers,
  DollarSign,
  ShieldAlert
} from 'lucide-react';

export const RawMaterialsView: React.FC = () => {
  const {
    currentUser,
    navigateTo,
    rawMaterials,
    addRawMaterial,
    updateRawMaterial,
    restockRawMaterial,
    deleteRawMaterial,
    settings
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';
  const isProdManager = currentUser?.role === 'production_manager';
  const isAuthorized = isAdmin || isProdManager;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);
  const [restockMaterial, setRestockMaterial] = useState<RawMaterial | null>(null);
  const [restockQty, setRestockQty] = useState<number>(50);

  // Form State for New/Edit Material
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    category: 'harinas' as RawMaterialCategory,
    unit: 'kg' as RawMaterialUnit,
    current_stock: 50,
    minimum_stock: 20,
    cost_per_unit: 1.25,
    supplier: ''
  });

  // Filtered List
  const filteredMaterials = rawMaterials.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || m.category === selectedCategory;
    const matchStatus = selectedStatus === 'all' || m.status === selectedStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  // Summaries
  const totalValue = rawMaterials.reduce((sum, m) => sum + m.current_stock * m.cost_per_unit, 0);
  const criticalCount = rawMaterials.filter((m) => m.status === 'CRITICAL' || m.status === 'OUT_OF_STOCK').length;

  const handleOpenAddModal = () => {
    const nextSkuNum = String(rawMaterials.length + 1).padStart(2, '0');
    setFormData({
      sku: `INS-NEW-${nextSkuNum}`,
      name: '',
      category: 'harinas',
      unit: 'kg',
      current_stock: 50,
      minimum_stock: 20,
      cost_per_unit: 1.25,
      supplier: 'Molinos del Valle'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (mat: RawMaterial) => {
    setEditingMaterial(mat);
    setFormData({
      sku: mat.sku,
      name: mat.name,
      category: mat.category,
      unit: mat.unit,
      current_stock: mat.current_stock,
      minimum_stock: mat.minimum_stock,
      cost_per_unit: mat.cost_per_unit,
      supplier: mat.supplier
    });
  };

  const handleSaveMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMaterial) {
      updateRawMaterial(editingMaterial.id, {
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        current_stock: formData.current_stock,
        minimum_stock: formData.minimum_stock,
        cost_per_unit: formData.cost_per_unit,
        supplier: formData.supplier
      });
      setEditingMaterial(null);
    } else {
      addRawMaterial({
        sku: formData.sku,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        current_stock: formData.current_stock,
        minimum_stock: formData.minimum_stock,
        cost_per_unit: formData.cost_per_unit,
        supplier: formData.supplier
      });
      setIsAddModalOpen(false);
    }
  };

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restockMaterial && restockQty > 0) {
      restockRawMaterial(restockMaterial.id, restockQty);
      setRestockMaterial(null);
    }
  };

  const getCategoryLabel = (cat: RawMaterialCategory) => {
    switch (cat) {
      case 'harinas':
        return 'Harinas & Granos';
      case 'levaduras_masa':
        return 'Masa Madre & Levaduras';
      case 'lacteos':
        return 'Lácteos & Quesos';
      case 'grasas':
        return 'Mantequillas & Grasas';
      case 'azucares_chocolates':
        return 'Chocolates & Azúcares';
      case 'frutos_semillas':
        return 'Semillas & Frutos';
      case 'empaques':
        return 'Empaques & Cajas';
      case 'otros':
        return 'Huevos & Varios';
    }
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-6 bg-red-500/15 border border-red-500/30 rounded-2xl space-y-3">
          <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
          <h2 className="text-lg font-bold text-white">Acceso Restringido</h2>
          <p className="text-xs text-slate-300">
            Esta sección contiene información confidencial de insumos y almacén, reservada exclusivamente para el administrador y el jefe de producción.
          </p>
          <button
            onClick={() => navigateTo(currentUser?.role === 'customer' ? 'PRODUCTS_RECIPES' : 'DASHBOARD')}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
          >
            Volver a mi área autorizada
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-2">
            <Package className="w-3.5 h-3.5" />
            <span>Inventario de Insumos (SCR-03)</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
            Control de Materias Primas
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Control de existencias, cálculo de costos y reposición de almacén.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Nuevo Insumo</span>
        </button>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Insumos Catalogados
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-white">
              {rawMaterials.length}
            </span>
            <span className="text-xs text-slate-400">materias primas</span>
          </div>
        </div>

        {/* Financial valuation only visible to Admin */}
        {isAdmin ? (
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Valoración Total en Almacén
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-amber-400">
                {settings.currency_symbol}{totalValue.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400">costo inventario</span>
            </div>
          </div>
        ) : (
          <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Insumos en Estado Óptimo
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-3xl font-extrabold text-emerald-400">
                {rawMaterials.filter(m => m.status === 'OPTIMAL').length}
              </span>
              <span className="text-xs text-slate-400">con stock adecuado</span>
            </div>
          </div>
        )}

        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Alertas de Stock
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`font-heading text-3xl font-extrabold ${criticalCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {criticalCount}
            </span>
            <span className="text-xs text-slate-400">en estado crítico / agotado</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, SKU o proveedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          >
            <option value="all">Todas las Categorías</option>
            <option value="harinas">Harinas & Granos</option>
            <option value="levaduras_masa">Masa Madre & Levaduras</option>
            <option value="lacteos">Lácteos</option>
            <option value="grasas">Mantequillas / Grasas</option>
            <option value="azucares_chocolates">Chocolates & Azúcares</option>
            <option value="frutos_semillas">Semillas & Frutos</option>
            <option value="empaques">Empaques</option>
            <option value="otros">Otros</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          >
            <option value="all">Todos los Estados</option>
            <option value="OPTIMAL">Óptimo</option>
            <option value="CRITICAL">Crítico</option>
            <option value="OUT_OF_STOCK">Agotado</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700 text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-4">SKU / Insumo</th>
                <th className="py-3.5 px-4">Categoría</th>
                <th className="py-3.5 px-4">Stock Actual / Mínimo</th>
                {isAdmin && <th className="py-3.5 px-4">Costo Unitario</th>}
                {isAdmin && <th className="py-3.5 px-4">Valor Total</th>}
                <th className="py-3.5 px-4">Proveedor</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 6} className="text-center py-10 text-slate-400">
                    No se encontraron insumos que coincidan con la búsqueda o filtro.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => {
                  const stockPercent = Math.min(100, Math.round((mat.current_stock / mat.minimum_stock) * 100));
                  const itemValue = mat.current_stock * mat.cost_per_unit;

                  return (
                    <tr key={mat.id} className="hover:bg-slate-800/60 transition-colors">
                      {/* SKU & Name */}
                      <td className="py-3 px-4">
                        <span className="font-mono text-[10px] text-amber-400 font-bold block">
                          {mat.sku}
                        </span>
                        <span className="font-bold text-slate-100 text-xs">{mat.name}</span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-300">
                        {getCategoryLabel(mat.category)}
                      </td>

                      {/* Stock & Progress */}
                      <td className="py-3 px-4 min-w-[160px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-white">
                            {mat.current_stock} {mat.unit}
                          </span>
                          <span className="text-slate-400">Mín: {mat.minimum_stock} {mat.unit}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              mat.status === 'OUT_OF_STOCK'
                                ? 'bg-red-500'
                                : mat.status === 'CRITICAL'
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${stockPercent}%` }}
                          />
                        </div>
                      </td>

                      {/* Cost - Protected for Admin */}
                      {isAdmin && (
                        <td className="py-3 px-4 text-slate-200">
                          {settings.currency_symbol}{mat.cost_per_unit.toFixed(2)} / {mat.unit}
                        </td>
                      )}

                      {/* Total Value - Protected for Admin */}
                      {isAdmin && (
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          {settings.currency_symbol}{itemValue.toFixed(2)}
                        </td>
                      )}

                      {/* Supplier */}
                      <td className="py-3 px-4 text-slate-400">
                        {mat.supplier}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4">
                        {mat.status === 'OUT_OF_STOCK' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                            Agotado
                          </span>
                        )}
                        {mat.status === 'CRITICAL' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            Crítico
                          </span>
                        )}
                        {mat.status === 'OPTIMAL' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Óptimo
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setRestockMaterial(mat);
                              setRestockQty(mat.minimum_stock * 2);
                            }}
                            className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 transition-colors cursor-pointer"
                            title="Reabastecer stock"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(mat)}
                            className="p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
                            title="Editar insumo"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => deleteRawMaterial(mat.id)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-colors cursor-pointer"
                              title="Eliminar insumo (Solo Admin)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit Material */}
      {(isAddModalOpen || editingMaterial) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-heading text-lg font-bold text-white">
                {editingMaterial ? 'Editar Materia Prima' : 'Registrar Nuevo Insumo'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingMaterial(null);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMaterial} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as RawMaterialCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="harinas">Harinas & Granos</option>
                    <option value="levaduras_masa">Masa Madre & Levaduras</option>
                    <option value="lacteos">Lácteos</option>
                    <option value="grasas">Mantequillas / Grasas</option>
                    <option value="azucares_chocolates">Chocolates & Azúcares</option>
                    <option value="frutos_semillas">Semillas & Frutos</option>
                    <option value="empaques">Empaques</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Insumo *</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Harina de Trigo W300 Ecológica"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unidad</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as RawMaterialUnit })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="l">litro (l)</option>
                    <option value="ml">ml</option>
                    <option value="ud">unidad (ud)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Actual</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.current_stock}
                    onChange={(e) => setFormData({ ...formData, current_stock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.minimum_stock}
                    onChange={(e) => setFormData({ ...formData, minimum_stock: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Costo Unitario ({settings.currency_symbol}) {!isAdmin && <span className="text-amber-400 font-normal">(Solo Admin)</span>}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    disabled={!isAdmin}
                    value={formData.cost_per_unit}
                    onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })}
                    className={`w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs ${
                      isAdmin ? 'text-white' : 'text-slate-500 cursor-not-allowed'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Proveedor Habitual</label>
                  <input
                    type="text"
                    placeholder="Molinos del Duero"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingMaterial(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingMaterial ? 'Guardar Cambios' : 'Registrar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Reabastecer */}
      {restockMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-amber-400" />
              <span>Entrada de Insumo (Reabastecer)</span>
            </h3>

            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-slate-400 block">Insumo:</span>
                <span className="font-bold text-white block text-sm">{restockMaterial.name}</span>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Stock Actual: {restockMaterial.current_stock} {restockMaterial.unit}</span>
                  <span>Mínimo: {restockMaterial.minimum_stock} {restockMaterial.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cantidad Recibida a Añadir ({restockMaterial.unit}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockMaterial(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  Asentar en Inventario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
