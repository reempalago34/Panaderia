import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory, RawMaterialUnit, RecipeItem } from '../../types';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Layers,
  Clock,
  Weight,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Edit3,
  Trash2,
  CheckCircle2,
  X,
  PieChart,
  Percent,
  ShoppingBag,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const ProductsRecipesView: React.FC = () => {
  const {
    products,
    recipeItems,
    rawMaterials,
    settings,
    currentUser,
    navigateTo,
    calculateProductCost,
    addProductWithRecipe,
    updateProductWithRecipe,
    deleteProduct
  } = useApp();

  const isCustomer = currentUser?.role === 'customer';
  const isCashier = currentUser?.role === 'cashier';
  const isAdmin = currentUser?.role === 'admin';
  const isHeadBaker = currentUser?.role === 'head_baker';
  const canEditProduct = isAdmin || isHeadBaker;
  const canDeleteProduct = isAdmin;
  const canViewFinancials = isAdmin;
  const canCreateProduct = isAdmin || isHeadBaker;
  const canViewFormulas = isAdmin || isHeadBaker || currentUser?.role === 'production_manager';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    category: 'panaderia' as ProductCategory,
    description: '',
    price: 4.50,
    preparation_time_hours: 24,
    portions_or_weight: '800 g',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  });

  // Ingredients breakdown in form
  const [recipeFormItems, setRecipeFormItems] = useState<Array<{ raw_material_id: string; quantity: number }>>([
    { raw_material_id: rawMaterials[0]?.id || '', quantity: 0.5 }
  ]);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const nextNum = String(products.length + 1).padStart(2, '0');
    setProductForm({
      sku: `PROD-NEW-${nextNum}`,
      name: '',
      category: 'panaderia',
      description: '',
      price: 5.00,
      preparation_time_hours: 24,
      portions_or_weight: '850 g',
      is_active: true,
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
    });
    setRecipeFormItems([{ raw_material_id: rawMaterials[0]?.id || '', quantity: 0.5 }]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      sku: prod.sku,
      name: prod.name,
      category: prod.category,
      description: prod.description,
      price: prod.price,
      preparation_time_hours: prod.preparation_time_hours,
      portions_or_weight: prod.portions_or_weight,
      is_active: prod.is_active,
      image_url: prod.image_url
    });

    const currentRecipes = recipeItems
      .filter((r) => r.product_id === prod.id)
      .map((r) => ({ raw_material_id: r.raw_material_id, quantity: r.quantity }));

    setRecipeFormItems(currentRecipes.length > 0 ? currentRecipes : [{ raw_material_id: rawMaterials[0]?.id || '', quantity: 0.5 }]);
    setIsModalOpen(true);
  };

  const handleAddIngredientRow = () => {
    setRecipeFormItems((prev) => [...prev, { raw_material_id: rawMaterials[0]?.id || '', quantity: 0.1 }]);
  };

  const handleRemoveIngredientRow = (index: number) => {
    setRecipeFormItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProductWithRecipe(editingProduct.id, productForm, recipeFormItems);
    } else {
      addProductWithRecipe(productForm, recipeFormItems);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase mb-2">
            {isCustomer ? <Sparkles className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
            <span>
              {isCustomer ? 'Catálogo Artesanal de Masa Madre' : 'Catálogo & Fichas Técnicas (SCR-04)'}
            </span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-white tracking-tight">
            {isCustomer ? 'Nuestras Especialidades & Panes de Autor' : 'Productos & Explosión de Recetas'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {isCustomer
              ? 'Elaborados a mano con harinas ecológicas seleccionadas, fermentación lenta en frío (24h-48h) y masa madre salvaje centenaria.'
              : 'Fichas técnicas con formulaciones por batch, parámetros de horneado y control de materias primas.'}
          </p>
        </div>

        {isCustomer ? (
          <button
            onClick={() => navigateTo('ORDER_CREATE')}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>+ Realizar Encargo Online</span>
          </button>
        ) : canCreateProduct ? (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Producto & Ficha</span>
          </button>
        ) : null}
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isCustomer ? "Buscar por pan, sabor, tarta o especialidad..." : "Buscar por nombre, SKU o descripción de producto..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
          >
            <option value="all">Todas las Familias</option>
            <option value="panaderia">Panadería Tradicional</option>
            <option value="viennoiserie">Viennoiserie & Hojaldres</option>
            <option value="pasteleria">Pastelería & Tartas</option>
            <option value="salados">Especialidades Saladas</option>
          </select>
        </div>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const costData = calculateProductCost(product.id);
          const isExpanded = expandedRecipeId === product.id;
          const productRecipes = recipeItems.filter((r) => r.product_id === product.id);

          return (
            <div
              key={product.id}
              className="bg-[#1E293B] border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl hover:border-slate-600 transition-all flex flex-col"
            >
              {/* Product Card Image & Badge */}
              <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-transparent to-black/40" />

                <div className="absolute top-3 left-3 flex items-center gap-2">
                  {!isCustomer && (
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/60 text-amber-300 border border-amber-500/30 backdrop-blur-xs">
                      {product.sku}
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-900/80 text-slate-300 border border-slate-700 backdrop-blur-xs capitalize">
                    {product.category}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  {canEditProduct && (
                    <button
                      onClick={() => handleOpenEditModal(product)}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-slate-200 border border-slate-700 backdrop-blur-xs transition-colors cursor-pointer"
                      title="Editar producto"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDeleteProduct && (
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className="p-1.5 rounded-lg bg-black/60 hover:bg-red-600 text-red-400 hover:text-white border border-slate-700 backdrop-blur-xs transition-colors cursor-pointer"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isCustomer && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/80 text-slate-950 shadow-sm">
                      Masa Madre Viva
                    </span>
                  )}
                </div>

                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div className="text-white">
                    <span className="text-[11px] text-slate-300 block">{product.portions_or_weight}</span>
                    <h3 className="font-heading font-bold text-base text-white leading-tight">{product.name}</h3>
                  </div>
                  <span className="font-heading font-extrabold text-xl text-amber-400">
                    {settings.currency_symbol}{product.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {product.description}
                </p>

                {/* Specs: Fermentation Time & Costing */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Fermentación:</span>
                    </span>
                    <span className="font-bold text-slate-200">{product.preparation_time_hours}h en frío</span>
                  </div>

                  {canViewFinancials ? (
                    <>
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <PieChart className="w-3.5 h-3.5 text-blue-400" />
                          <span>Costo Materias Primas:</span>
                        </span>
                        <span className="font-bold text-slate-200">
                          {settings.currency_symbol}{costData.cost.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800">
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Margen Bruto Confidencial:</span>
                        </span>
                        <span className="font-bold text-emerald-400">
                          {costData.margin}% (+{settings.currency_symbol}{costData.profit.toFixed(2)})
                        </span>
                      </div>
                    </>
                  ) : isCustomer ? (
                    <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span className="text-slate-400">Calidad:</span>
                      <span className="text-amber-300 font-semibold">100% Harinas Limpias Molidas a la Piedra</span>
                    </div>
                  ) : (
                    <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                      <span>Formato / Peso:</span>
                      <span className="text-slate-200 font-semibold">{product.portions_or_weight}</span>
                    </div>
                  )}
                </div>

                {/* Customer / Cashier CTA or Recipe Expansion */}
                {isCustomer ? (
                  <button
                    onClick={() => navigateTo('ORDER_CREATE', product.id)}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>+ Hacer Encargo de este Producto</span>
                  </button>
                ) : isCashier ? (
                  <button
                    onClick={() => navigateTo('ORDER_CREATE', product.id)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>+ Crear Encargo en Mostrador</span>
                  </button>
                ) : canViewFormulas ? (
                  <div>
                    <button
                      onClick={() => setExpandedRecipeId(isExpanded ? null : product.id)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ficha Técnica ({productRecipes.length} insumos)</span>
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Expanded Recipe Breakdown */}
                    {isExpanded && (
                      <div className="mt-2 p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 animate-in fade-in duration-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Ingredientes por Unidad Producida:
                        </span>
                        <div className="space-y-1.5">
                          {productRecipes.map((item) => {
                            const mat = rawMaterials.find((m) => m.id === item.raw_material_id);
                            const itemCost = mat ? item.quantity * mat.cost_per_unit : 0;
                            return (
                              <div key={item.id} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800 last:border-0">
                                <span className="text-slate-300 font-medium">
                                  {mat ? mat.name : 'Insumo'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-amber-300 font-bold">
                                    {item.quantity} {item.unit}
                                  </span>
                                  {isAdmin && (
                                    <span className="text-slate-400">
                                      ({settings.currency_symbol}{itemCost.toFixed(2)})
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1E293B] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-heading text-lg font-bold text-white">
                {editingProduct ? 'Editar Producto y Ficha Técnica' : 'Nuevo Producto con Ficha de Receta'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              {/* Product Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Hogaza de Centeno y Masa Madre"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  >
                    <option value="panaderia">Panadería</option>
                    <option value="viennoiserie">Viennoiserie</option>
                    <option value="pasteleria">Pastelería</option>
                    <option value="salados">Salados</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Precio Venta ({settings.currency_symbol}) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-bold text-amber-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Peso / Porciones</label>
                  <input
                    type="text"
                    required
                    placeholder="850 g o 8 porciones"
                    value={productForm.portions_or_weight}
                    onChange={(e) => setProductForm({ ...productForm, portions_or_weight: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción Comercial</label>
                <textarea
                  rows={2}
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              {/* Recipe Breakdown Items */}
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Ficha Técnica: Insumos Requeridos por Unidad</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleAddIngredientRow}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-bold text-[11px] border border-amber-500/40 transition-colors cursor-pointer"
                  >
                    + Agregar Insumo
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {recipeFormItems.map((row, idx) => {
                    const selectedMat = rawMaterials.find((m) => m.id === row.raw_material_id);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={row.raw_material_id}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRecipeFormItems((prev) =>
                              prev.map((item, i) => (i === idx ? { ...item, raw_material_id: val } : item))
                            );
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white"
                        >
                          {rawMaterials.map((mat) => (
                            <option key={mat.id} value={mat.id}>
                              {mat.name} ({mat.unit}) - Stock: {mat.current_stock}
                            </option>
                          ))}
                        </select>

                        <div className="w-28 flex items-center gap-1">
                          <input
                            type="number"
                            step="0.001"
                            required
                            placeholder="Cantidad"
                            value={row.quantity}
                            onChange={(e) => {
                              const q = parseFloat(e.target.value) || 0;
                              setRecipeFormItems((prev) =>
                                prev.map((item, i) => (i === idx ? { ...item, quantity: q } : item))
                              );
                            }}
                            className="w-full px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white text-right"
                          />
                          <span className="text-[11px] text-slate-400 font-mono">
                            {selectedMat ? selectedMat.unit : 'kg'}
                          </span>
                        </div>

                        {recipeFormItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredientRow(idx)}
                            className="p-1.5 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingProduct ? 'Actualizar Ficha Técnica' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
