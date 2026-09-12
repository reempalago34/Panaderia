import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AppView,
  NavigationState,
  UserProfile,
  UserAccount,
  UserRole,
  RawMaterial,
  Product,
  RecipeItem,
  Order,
  OrderItem,
  BakerySettings,
  IngredientExplosionRequirement,
  OrderStatus,
  StockStatus
} from '../types';
import {
  INITIAL_PROFILES,
  INITIAL_ACCOUNTS,
  DEFAULT_DEMO_PASSWORD,
  INITIAL_RAW_MATERIALS,
  INITIAL_PRODUCTS,
  INITIAL_RECIPE_ITEMS,
  INITIAL_ORDERS,
  INITIAL_ORDER_ITEMS,
  INITIAL_SETTINGS
} from '../data/seedData';
import { getSupabaseClient, supabaseSignIn, supabaseSignUp } from '../services/supabase';
import { isViewAllowedForRole, getDefaultViewForRole } from '../utils/permissions';
import { hashPassword, isHashedPassword, HASHED_ADMIN_PASSWORD } from '../utils/passwordHash';

interface AppContextType {
  navigation: NavigationState;
  navigateTo: (view: AppView, selectedItemId?: string | null, filterCategory?: string | null) => void;
  currentUser: UserProfile | null;
  switchUser: (userId: string) => void;
  profiles: UserProfile[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerUser: (userData: {
    full_name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar_url?: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteUserProfile: (userId: string) => { success: boolean; error?: string };

  // Entities
  rawMaterials: RawMaterial[];
  products: Product[];
  recipeItems: RecipeItem[];
  orders: Order[];
  orderItems: OrderItem[];
  settings: BakerySettings;

  // Actions
  createOrder: (orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'status' | 'remaining_balance'>, items: Array<{ product_id: string; quantity: number }>) => { success: boolean; error?: string; order?: Order };
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  processOrderProduction: (orderId: string) => { success: boolean; message: string; blocked?: boolean };
  processDailyKitchenProduction: (targetDateStr: string) => { success: boolean; processedOrders: number; blockedOrders: number; message: string };
  recordOrderPayment: (orderId: string, additionalPayment: number) => void;

  // Raw Materials CRUD
  addRawMaterial: (material: Omit<RawMaterial, 'id' | 'status' | 'last_restocked_at'>) => void;
  updateRawMaterial: (id: string, updates: Partial<RawMaterial>) => void;
  restockRawMaterial: (id: string, quantityToAdd: number, newCost?: number) => void;
  deleteRawMaterial: (id: string) => { success: boolean; error?: string };

  // Products & Recipes CRUD
  addProductWithRecipe: (productData: Omit<Product, 'id'>, ingredients: Array<{ raw_material_id: string; quantity: number }>) => void;
  updateProductWithRecipe: (productId: string, productData: Partial<Product>, ingredients: Array<{ raw_material_id: string; quantity: number }>) => void;
  deleteProduct: (id: string) => { success: boolean; error?: string };

  // Calculators & Helpers
  calculateProductCost: (productId: string) => { cost: number; margin: number; profit: number };
  getRecipeExplosionForOrder: (orderId: string) => IngredientExplosionRequirement[];
  getRecipeExplosionForDate: (dateStr: string) => IngredientExplosionRequirement[];
  updateSettings: (newSettings: Partial<BakerySettings>) => void;
  resetToDemoData: () => void;

  // Feedback Toast
  toast: { message: string; type: 'success' | 'error' | 'warning' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  clearToast: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  NAV: 'mazamadre_nav',
  USER: 'mazamadre_current_user',
  PROFILES: 'mazamadre_profiles',
  ACCOUNTS: 'mazamadre_accounts',
  MATERIALS: 'mazamadre_raw_materials',
  PRODUCTS: 'mazamadre_products',
  RECIPES: 'mazamadre_recipe_items',
  ORDERS: 'mazamadre_orders',
  ORDER_ITEMS: 'mazamadre_order_items',
  SETTINGS: 'mazamadre_settings'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation State - Defaults to AUTH view first before everything
  const [navigation, setNavigation] = useState<NavigationState>(() => {
    return { currentView: 'AUTH', selectedItemId: null };
  });

  // Profiles & User Accounts - Default Admin account (Usuario: Admin / Contraseña: Admin123)
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
      if (saved) {
        const parsed: UserProfile[] = JSON.parse(saved);
        // Clean out legacy demo accounts if present
        const hasLegacyDemos = parsed.some((p) => p.id === 'usr-baker-02' || p.id === 'usr-prod-03' || p.id === 'usr-cashier-04');
        if (hasLegacyDemos) {
          return INITIAL_PROFILES;
        }
        return parsed.length > 0 ? parsed : INITIAL_PROFILES;
      }
      return INITIAL_PROFILES;
    } catch {
      return INITIAL_PROFILES;
    }
  });

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (saved) {
        const parsed: UserAccount[] = JSON.parse(saved);
        const hasLegacyDemos = parsed.some((a) => a.id === 'usr-baker-02' || a.id === 'usr-prod-03' || a.id === 'usr-cashier-04');
        if (hasLegacyDemos) {
          return INITIAL_ACCOUNTS;
        }
        // Ensure admin has password Admin123
        return parsed.map((a) => (a.role === 'admin' ? { ...a, password: HASHED_ADMIN_PASSWORD } : a));
      }
      return INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  // Current User - Login starts by default before anything
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    // Requires login before accessing any bakery operations
    return null;
  });

  // Master Data
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MATERIALS);
      return saved ? JSON.parse(saved) : INITIAL_RAW_MATERIALS;
    } catch {
      return INITIAL_RAW_MATERIALS;
    }
  });

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [recipeItems, setRecipeItems] = useState<RecipeItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECIPES);
      return saved ? JSON.parse(saved) : INITIAL_RECIPE_ITEMS;
    } catch {
      return INITIAL_RECIPE_ITEMS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ORDER_ITEMS);
      return saved ? JSON.parse(saved) : INITIAL_ORDER_ITEMS;
    } catch {
      return INITIAL_ORDER_ITEMS;
    }
  });

  const [settings, setSettings] = useState<BakerySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const clearToast = () => setToast(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NAV, JSON.stringify(navigation));
  }, [navigation]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MATERIALS, JSON.stringify(rawMaterials));
  }, [rawMaterials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECIPES, JSON.stringify(recipeItems));
  }, [recipeItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDER_ITEMS, JSON.stringify(orderItems));
  }, [orderItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Navigation Helper with Authentication Guard & Role-Based Access Control (RBAC)
  const navigateTo = (view: AppView, selectedItemId: string | null = null, filterCategory: string | null = null) => {
    // If no user is logged in, always enforce AUTH view
    if (!currentUser && view !== 'AUTH') {
      showToast('Acceso restringido: Inicie sesión para acceder al obrador.', 'warning');
      setNavigation({
        currentView: 'AUTH',
        selectedItemId: null,
        filterCategory: null
      });
      return;
    }

    // Role-Based Access Control Verification
    if (currentUser && view !== 'AUTH') {
      const allowed = isViewAllowedForRole(currentUser.role, view);
      if (!allowed) {
        let roleMsg = '';
        if (currentUser.role === 'customer') {
          roleMsg = 'Como cliente particular solo tiene acceso a consultar el catálogo de panadería y realizar o consultar sus propios encargos.';
        } else if (currentUser.role === 'head_baker') {
          roleMsg = 'El Maestro Panadero solo tiene acceso a su rama de trabajo: fichas técnicas, recetas, inventario y consolidado de cocina.';
        } else if (currentUser.role === 'production_manager') {
          roleMsg = 'La Encargada de Producción solo tiene acceso a inventario de insumos, consolidado diario de cocina y recetas.';
        } else if (currentUser.role === 'cashier') {
          roleMsg = 'El personal de caja y mostrador solo tiene acceso a pedidos, creación de encargos y consulta de catálogo.';
        } else {
          roleMsg = 'Sección confidencial restringida exclusivamente al Administrador / Propietario.';
        }

        showToast(`Acceso restringido: ${roleMsg}`, 'warning');
        const fallback = getDefaultViewForRole(currentUser.role);
        setNavigation({
          currentView: fallback,
          selectedItemId: null,
          filterCategory: null
        });
        return;
      }
    }

    setNavigation({
      currentView: view,
      selectedItemId,
      filterCategory
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Authentication & User Management (Usuario: Admin / Contraseña: Admin123)
  const login = async (identifier: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanId = identifier.trim();
    if (!cleanId) {
      return { success: false, error: 'Por favor ingrese su usuario o correo electrónico.' };
    }
    if (!password) {
      return { success: false, error: 'Por favor ingrese su contraseña.' };
    }

    const lowerId = cleanId.toLowerCase();
    const isAdminIdentifier = lowerId === 'admin' || lowerId === 'admin@mazamadre.com' || lowerId === 'elena@mazamadre.com';

    // Try Supabase Auth if credentials exist and identifier is an email
    if (settings.supabase_url && settings.supabase_anon_key && cleanId.includes('@')) {
      const sbResult = await supabaseSignIn(settings.supabase_url, settings.supabase_anon_key, lowerId, password);
      if (!sbResult.success && !userAccounts.some((a) => a.email.toLowerCase() === lowerId)) {
        showToast(`Aviso Supabase: ${sbResult.error}`, 'warning');
      }
    }

    // Match with registered accounts or profiles (matching email or 'admin')
    let account = userAccounts.find((a) => a.email.toLowerCase() === lowerId || (isAdminIdentifier && a.role === 'admin'));
    let profile = profiles.find((p) => p.email.toLowerCase() === lowerId || (isAdminIdentifier && p.role === 'admin'));

    // Fallback: If logging in as admin and state didn't find it, use initial admin
    if (isAdminIdentifier && (!account || !profile)) {
      profile = INITIAL_PROFILES[0];
      account = INITIAL_ACCOUNTS[0];
    }

    if (!account && !profile) {
      return { success: false, error: 'Usuario no encontrado. Verifique el usuario o correo ingresado.' };
    }

    const targetAccount: UserAccount = account || {
      ...profile!,
      password: profile?.role === 'admin' ? HASHED_ADMIN_PASSWORD : undefined
    };

    // Check password matching. Prefers hashed comparison, falls back to legacy
    // plaintext accounts stored by previous versions and the demo admin password.
    const storedPassword = targetAccount.password || '';
    const enteredHash = await hashPassword(password);
    const isPasswordValid =
      (isHashedPassword(storedPassword) && storedPassword === enteredHash) ||
      (!isHashedPassword(storedPassword) && storedPassword === password) ||
      (targetAccount.role === 'admin' && (password === 'Admin123' || password === 'admin123'));

    if (!isPasswordValid) {
      return { success: false, error: 'Contraseña incorrecta. Verifique sus credenciales de acceso.' };
    }

    // Security hardening: migrate legacy plaintext accounts to hashed format in place.
    if (account && !isHashedPassword(storedPassword) && storedPassword) {
      const newHash = await hashPassword(storedPassword);
      setUserAccounts((prev) => prev.map((a) => (a.id === account?.id ? { ...a, password: newHash } : a)));
    }

    const authenticatedProfile: UserProfile = {
      id: targetAccount.id,
      email: targetAccount.email,
      full_name: targetAccount.full_name,
      role: targetAccount.role,
      avatar_url: targetAccount.avatar_url,
      phone: targetAccount.phone,
      created_at: targetAccount.created_at
    };

    setCurrentUser(authenticatedProfile);
    showToast(`¡Sesión iniciada con éxito como ${authenticatedProfile.full_name}!`, 'success');
    navigateTo(getDefaultViewForRole(authenticatedProfile.role));
    return { success: true };
  };

  const registerUser = async (userData: {
    full_name: string;
    email: string;
    password: string;
    role: UserRole;
    avatar_url?: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanName = userData.full_name.trim();
    const cleanEmail = userData.email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      return { success: false, error: 'El nombre completo debe tener al menos 2 caracteres.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'El formato del correo electrónico no es válido.' };
    }

    if (!userData.password || userData.password.length < 6) {
      return { success: false, error: 'La contraseña debe contener al menos 6 caracteres.' };
    }

    // Privilege escalation guard: only an authenticated admin may create staff/admin accounts.
    // Public self-registration is limited to customer accounts.
    const isAdminRegistring = currentUser?.role === 'admin';
    if (userData.role !== 'customer' && !isAdminRegistring) {
      return {
        success: false,
        error: 'Acceso restringido: Solo el Administrador del obrador puede dar de alta personal (panadero, producción, caja o admin). Los clientes pueden registrarse como cuenta de cliente.'
      };
    }

    // Check duplicate
    const exists = profiles.some((p) => p.email.toLowerCase() === cleanEmail) ||
                   userAccounts.some((a) => a.email.toLowerCase() === cleanEmail);
    if (exists) {
      return { success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' };
    }

    // Supabase Auth signup if configured
    if (settings.supabase_url && settings.supabase_anon_key) {
      const sbResult = await supabaseSignUp(
        settings.supabase_url,
        settings.supabase_anon_key,
        cleanEmail,
        userData.password,
        { full_name: cleanName, role: userData.role }
      );
      if (!sbResult.success) {
        console.warn('Supabase auth notice:', sbResult.error);
      }
    }

    // Role-tailored avatar if none provided
    let finalAvatar = userData.avatar_url?.trim();
    if (!finalAvatar) {
      switch (userData.role) {
        case 'admin':
          finalAvatar = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80';
          break;
        case 'head_baker':
          finalAvatar = 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80';
          break;
        case 'production_manager':
          finalAvatar = 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80';
          break;
        case 'cashier':
          finalAvatar = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80';
          break;
        case 'customer':
          finalAvatar = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80';
          break;
      }
    }

    const newId = `usr-${Date.now()}`;
    const newProfile: UserProfile = {
      id: newId,
      email: cleanEmail,
      full_name: cleanName,
      role: userData.role,
      avatar_url: finalAvatar,
      phone: userData.phone?.trim() || undefined,
      created_at: new Date().toISOString()
    };

    const newAccount: UserAccount = {
      ...newProfile,
      password: await hashPassword(userData.password)
    };

    setProfiles((prev) => [newProfile, ...prev]);
    setUserAccounts((prev) => [newAccount, ...prev]);
    setCurrentUser(newProfile);
    showToast(`¡Usuario ${newProfile.full_name} registrado y autenticado exitosamente!`, 'success');
    navigateTo(getDefaultViewForRole(newProfile.role));

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Has cerrado sesión en MazaMadre Control', 'info');
    navigateTo('AUTH');
  };

  const switchUser = (userId: string) => {
    const found = profiles.find((p) => p.id === userId) || INITIAL_PROFILES.find((p) => p.id === userId);
    if (found) {
      setCurrentUser(found);
      showToast(`Sesión cambiada a: ${found.full_name} (${found.role})`, 'info');
      navigateTo(getDefaultViewForRole(found.role));
    }
  };

  const deleteUserProfile = (userId: string): { success: boolean; error?: string } => {
    if (currentUser?.role !== 'admin') {
      return { success: false, error: 'Acceso denegado: Solo el Administrador puede dar de baja o gestionar al personal del equipo.' };
    }
    if (currentUser?.id === userId) {
      return { success: false, error: 'No puede eliminar el usuario activo actualmente. Cierre sesión o cambie de usuario primero.' };
    }
    const target = profiles.find((p) => p.id === userId);
    if (!target) {
      return { success: false, error: 'Usuario no encontrado.' };
    }
    if (target.role === 'admin') {
      const adminCount = profiles.filter((p) => p.role === 'admin').length;
      if (adminCount <= 1) {
        return { success: false, error: 'Debe existir al menos un Administrador en el sistema.' };
      }
    }

    setProfiles((prev) => prev.filter((p) => p.id !== userId));
    setUserAccounts((prev) => prev.filter((a) => a.id !== userId));
    showToast(`Usuario ${target.full_name} retirado del personal del obrador.`, 'info');
    return { success: true };
  };

  // Helper to calculate stock status
  const calculateStockStatus = (current: number, min: number): StockStatus => {
    if (current <= 0) return 'OUT_OF_STOCK';
    if (current <= min) return 'CRITICAL';
    return 'OPTIMAL';
  };

  // Raw Materials CRUD
  const addRawMaterial = (materialData: Omit<RawMaterial, 'id' | 'status' | 'last_restocked_at'>) => {
    const status = calculateStockStatus(materialData.current_stock, materialData.minimum_stock);
    const newMat: RawMaterial = {
      ...materialData,
      id: `mat-${Date.now()}`,
      status,
      last_restocked_at: new Date().toISOString()
    };
    setRawMaterials((prev) => [newMat, ...prev]);
    showToast(`Insumo "${newMat.name}" añadido al inventario`, 'success');
  };

  const updateRawMaterial = (id: string, updates: Partial<RawMaterial>) => {
    setRawMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const currentStock = updates.current_stock !== undefined ? updates.current_stock : m.current_stock;
        const minStock = updates.minimum_stock !== undefined ? updates.minimum_stock : m.minimum_stock;
        const status = calculateStockStatus(currentStock, minStock);
        return { ...m, ...updates, status };
      })
    );
    showToast('Insumo actualizado exitosamente', 'success');
  };

  const restockRawMaterial = (id: string, quantityToAdd: number, newCost?: number) => {
    setRawMaterials((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const newStock = Math.max(0, m.current_stock + quantityToAdd);
        const status = calculateStockStatus(newStock, m.minimum_stock);
        return {
          ...m,
          current_stock: Number(newStock.toFixed(3)),
          cost_per_unit: newCost && newCost > 0 ? newCost : m.cost_per_unit,
          last_restocked_at: new Date().toISOString(),
          status
        };
      })
    );
    showToast(`Reabastecimiento registrado (+${quantityToAdd})`, 'success');
  };

  const deleteRawMaterial = (id: string): { success: boolean; error?: string } => {
    const isUsed = recipeItems.some((r) => r.raw_material_id === id);
    if (isUsed) {
      const errorMsg = 'No se puede eliminar este insumo porque forma parte de fichas técnicas de productos.';
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }
    setRawMaterials((prev) => prev.filter((m) => m.id !== id));
    showToast('Insumo eliminado del catálogo', 'info');
    return { success: true };
  };

  // Cost calculation for products
  const calculateProductCost = (productId: string): { cost: number; margin: number; profit: number } => {
    const product = products.find((p) => p.id === productId);
    if (!product) return { cost: 0, margin: 0, profit: 0 };

    const items = recipeItems.filter((r) => r.product_id === productId);
    let totalCost = 0;

    items.forEach((item) => {
      const mat = rawMaterials.find((m) => m.id === item.raw_material_id);
      if (mat) {
        totalCost += item.quantity * mat.cost_per_unit;
      }
    });

    const profit = Math.max(0, product.price - totalCost);
    const margin = product.price > 0 ? (profit / product.price) * 100 : 0;

    return {
      cost: Number(totalCost.toFixed(2)),
      margin: Number(margin.toFixed(1)),
      profit: Number(profit.toFixed(2))
    };
  };

  // Products CRUD
  const addProductWithRecipe = (
    productData: Omit<Product, 'id'>,
    ingredients: Array<{ raw_material_id: string; quantity: number }>
  ) => {
    const newProductId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newProductId
    };

    const newRecipes: RecipeItem[] = ingredients.map((ing, idx) => {
      const mat = rawMaterials.find((m) => m.id === ing.raw_material_id);
      return {
        id: `rec-${Date.now()}-${idx}`,
        product_id: newProductId,
        raw_material_id: ing.raw_material_id,
        quantity: ing.quantity,
        unit: mat ? mat.unit : 'kg'
      };
    });

    setProducts((prev) => [newProduct, ...prev]);
    setRecipeItems((prev) => [...prev, ...newRecipes]);
    showToast(`Producto "${newProduct.name}" y su receta registrados`, 'success');
  };

  const updateProductWithRecipe = (
    productId: string,
    productData: Partial<Product>,
    ingredients: Array<{ raw_material_id: string; quantity: number }>
  ) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, ...productData } : p))
    );

    // Replace recipe items for this product
    setRecipeItems((prev) => {
      const filtered = prev.filter((r) => r.product_id !== productId);
      const newItems: RecipeItem[] = ingredients.map((ing, idx) => {
        const mat = rawMaterials.find((m) => m.id === ing.raw_material_id);
        return {
          id: `rec-${Date.now()}-${idx}`,
          product_id: productId,
          raw_material_id: ing.raw_material_id,
          quantity: ing.quantity,
          unit: mat ? mat.unit : 'kg'
        };
      });
      return [...filtered, ...newItems];
    });

    showToast('Ficha técnica y producto actualizados', 'success');
  };

  const deleteProduct = (id: string): { success: boolean; error?: string } => {
    const isOrdered = orderItems.some((item) => item.product_id === id);
    if (isOrdered) {
      const errorMsg = 'No se puede eliminar el producto porque tiene pedidos registrados en el historial.';
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
    setRecipeItems((prev) => prev.filter((r) => r.product_id !== id));
    showToast('Producto eliminado del catálogo', 'info');
    return { success: true };
  };

  // Recipe Explosion for single order
  const getRecipeExplosionForOrder = (orderId: string): IngredientExplosionRequirement[] => {
    const items = orderItems.filter((oi) => oi.order_id === orderId);
    const materialMap = new Map<string, number>();

    items.forEach((orderItem) => {
      const recipes = recipeItems.filter((r) => r.product_id === orderItem.product_id);
      recipes.forEach((rec) => {
        const currentQty = materialMap.get(rec.raw_material_id) || 0;
        materialMap.set(rec.raw_material_id, currentQty + rec.quantity * orderItem.quantity);
      });
    });

    const result: IngredientExplosionRequirement[] = [];
    materialMap.forEach((requiredQty, matId) => {
      const mat = rawMaterials.find((m) => m.id === matId);
      if (mat) {
        const roundedReq = Number(requiredQty.toFixed(3));
        const deficit = Math.max(0, Number((roundedReq - mat.current_stock).toFixed(3)));
        result.push({
          raw_material: mat,
          required_quantity: roundedReq,
          current_stock: mat.current_stock,
          deficit,
          is_sufficient: mat.current_stock >= roundedReq
        });
      }
    });

    return result.sort((a, b) => (a.is_sufficient === b.is_sufficient ? 0 : a.is_sufficient ? 1 : -1));
  };

  // Recipe Explosion for all active orders of a date
  const getRecipeExplosionForDate = (dateStr: string): IngredientExplosionRequirement[] => {
    // Match date part YYYY-MM-DD
    const targetDay = dateStr.slice(0, 10);
    const dayOrders = orders.filter(
      (o) =>
        o.delivery_date.slice(0, 10) === targetDay &&
        o.status !== 'CANCELLED' &&
        o.status !== 'DELIVERED'
    );

    const materialMap = new Map<string, number>();

    dayOrders.forEach((ord) => {
      const items = orderItems.filter((oi) => oi.order_id === ord.id);
      items.forEach((item) => {
        const recipes = recipeItems.filter((r) => r.product_id === item.product_id);
        recipes.forEach((rec) => {
          const currentQty = materialMap.get(rec.raw_material_id) || 0;
          materialMap.set(rec.raw_material_id, currentQty + rec.quantity * item.quantity);
        });
      });
    });

    const result: IngredientExplosionRequirement[] = [];
    materialMap.forEach((requiredQty, matId) => {
      const mat = rawMaterials.find((m) => m.id === matId);
      if (mat) {
        const roundedReq = Number(requiredQty.toFixed(3));
        const deficit = Math.max(0, Number((roundedReq - mat.current_stock).toFixed(3)));
        result.push({
          raw_material: mat,
          required_quantity: roundedReq,
          current_stock: mat.current_stock,
          deficit,
          is_sufficient: mat.current_stock >= roundedReq
        });
      }
    });

    return result.sort((a, b) => (a.is_sufficient === b.is_sufficient ? 0 : a.is_sufficient ? 1 : -1));
  };

  // CREATE ORDER with strict RN-01 and RN-02 enforcement
  const createOrder = (
    orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'status' | 'remaining_balance'>,
    items: Array<{ product_id: string; quantity: number }>
  ): { success: boolean; error?: string; order?: Order } => {
    if (items.length === 0) {
      return { success: false, error: 'Debe agregar al menos un producto al pedido.' };
    }

    // Calculate total
    let totalAmount = 0;
    const computedItems: Array<{ product_id: string; quantity: number; unit_price: number; subtotal: number }> = [];

    for (const itm of items) {
      const prod = products.find((p) => p.id === itm.product_id);
      if (!prod) continue;
      const subtotal = Number((prod.price * itm.quantity).toFixed(2));
      totalAmount += subtotal;
      computedItems.push({
        product_id: itm.product_id,
        quantity: itm.quantity,
        unit_price: prod.price,
        subtotal
      });
    }

    totalAmount = Number(totalAmount.toFixed(2));

    // VALIDATION RN-01: Abono obligatorio >= 50%
    const minRequiredDeposit = Number((totalAmount * (settings.minimum_deposit_percentage / 100)).toFixed(2));
    if (orderData.deposit_amount < minRequiredDeposit - 0.01) {
      const errorMsg = `[RN-01] Abono insuficiente. El abono mínimo obligatorio es del ${settings.minimum_deposit_percentage}% (${settings.currency_symbol}${minRequiredDeposit.toFixed(2)}). Se intentó registrar: ${settings.currency_symbol}${orderData.deposit_amount.toFixed(2)}.`;
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }

    // VALIDATION RN-02: Antelación mínima de 24h
    const now = new Date();
    const deliveryDateObj = new Date(orderData.delivery_date);
    const hoursDiff = (deliveryDateObj.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDiff < settings.minimum_advance_hours - 0.1) {
      const errorMsg = `[RN-02] Antelación inválida. Los pedidos por encargo requieren un mínimo de ${settings.minimum_advance_hours} horas de anticipación para el proceso de fermentación artesanal.`;
      showToast(errorMsg, 'error');
      return { success: false, error: errorMsg };
    }

    // Generate Order Number Trigger equivalent
    const year = new Date().getFullYear();
    const nextSeq = String(orders.length + 101).padStart(4, '0');
    const orderNumber = `ORD-${year}-${nextSeq}`;
    const newOrderId = `ord-${Date.now()}`;
    const remainingBalance = Math.max(0, Number((totalAmount - orderData.deposit_amount).toFixed(2)));

    const newOrder: Order = {
      ...orderData,
      id: newOrderId,
      order_number: orderNumber,
      created_at: new Date().toISOString(),
      total_amount: totalAmount,
      deposit_amount: orderData.deposit_amount,
      remaining_balance: remainingBalance,
      status: 'CONFIRMED'
    };

    const newOrderItems: OrderItem[] = computedItems.map((ci, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      order_id: newOrderId,
      product_id: ci.product_id,
      quantity: ci.quantity,
      unit_price: ci.unit_price,
      subtotal: ci.subtotal
    }));

    setOrders((prev) => [newOrder, ...prev]);
    setOrderItems((prev) => [...prev, ...newOrderItems]);

    showToast(`Pedido ${orderNumber} registrado exitosamente con abono de ${settings.currency_symbol}${orderData.deposit_amount.toFixed(2)}`, 'success');
    return { success: true, order: newOrder };
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    showToast(`Estado de orden actualizado a "${newStatus}"`, 'info');
  };

  const recordOrderPayment = (orderId: string, additionalPayment: number) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const newDeposit = Math.min(o.total_amount, o.deposit_amount + additionalPayment);
        const newRemaining = Math.max(0, Number((o.total_amount - newDeposit).toFixed(2)));
        return {
          ...o,
          deposit_amount: Number(newDeposit.toFixed(2)),
          remaining_balance: newRemaining
        };
      })
    );
    showToast(`Pago de ${settings.currency_symbol}${additionalPayment.toFixed(2)} asentado en la comanda`, 'success');
  };

  // RN-03 & RN-04: Process Production for a single order
  const processOrderProduction = (orderId: string): { success: boolean; message: string; blocked?: boolean } => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Orden no encontrada' };

    const explosion = getRecipeExplosionForOrder(orderId);
    const missingItems = explosion.filter((e) => !e.is_sufficient);

    if (missingItems.length > 0) {
      // RN-04: Bloqueo preventivo
      const reasons = missingItems
        .map((m) => `Falta ${m.raw_material.name} (Déficit: ${m.deficit} ${m.raw_material.unit})`)
        .join('; ');
      
      const blockedReason = `[RN-04] Bloqueado por falta de insumos: ${reasons}`;

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'BLOCKED_BY_INSUMOS', blocked_reason: blockedReason } : o))
      );

      showToast(`Pedido ${order.order_number} BLOQUEADO por falta de insumos críticos`, 'error');
      return { success: false, message: blockedReason, blocked: true };
    }

    // RN-03: Deduct stock
    setRawMaterials((prev) =>
      prev.map((mat) => {
        const req = explosion.find((e) => e.raw_material.id === mat.id);
        if (!req) return mat;
        const newStock = Math.max(0, Number((mat.current_stock - req.required_quantity).toFixed(3)));
        const status = calculateStockStatus(newStock, mat.minimum_stock);
        return {
          ...mat,
          current_stock: newStock,
          status
        };
      })
    );

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'IN_PRODUCTION', blocked_reason: undefined } : o))
    );

    const successMsg = `[RN-03] Insumos deducidos del stock e inicio de producción para ${order.order_number}`;
    showToast(successMsg, 'success');
    return { success: true, message: successMsg };
  };

  // RN-03 & RN-04: Process Daily Kitchen Production for date
  const processDailyKitchenProduction = (targetDateStr: string): { success: boolean; processedOrders: number; blockedOrders: number; message: string } => {
    const targetDay = targetDateStr.slice(0, 10);
    const candidateOrders = orders.filter(
      (o) => o.delivery_date.slice(0, 10) === targetDay && (o.status === 'CONFIRMED' || o.status === 'BLOCKED_BY_INSUMOS')
    );

    if (candidateOrders.length === 0) {
      return {
        success: false,
        processedOrders: 0,
        blockedOrders: 0,
        message: 'No hay pedidos pendientes de enviar a producción para esta fecha.'
      };
    }

    // Running stock ledger so consecutive orders in the batch see the deductions
    // of the previous ones (avoids double-deduction and incorrect blocking).
    const stockLedger = new Map<string, number>(rawMaterials.map((m) => [m.id, m.current_stock]));
    const requiredMap = new Map<string, string>(); // raw_material_id -> material name
    const unitMap = new Map<string, string>(); // raw_material_id -> unit

    const computeRequirements = (orderId: string): Array<{ raw_material_id: string; required_quantity: number }> => {
      const items = orderItems.filter((oi) => oi.order_id === orderId);
      const materialQty = new Map<string, number>();
      items.forEach((orderItem) => {
        const recipes = recipeItems.filter((r) => r.product_id === orderItem.product_id);
        recipes.forEach((rec) => {
          materialQty.set(rec.raw_material_id, (materialQty.get(rec.raw_material_id) || 0) + rec.quantity * orderItem.quantity);
        });
      });
      const result: Array<{ raw_material_id: string; required_quantity: number }> = [];
      materialQty.forEach((qty, matId) => {
        if (!stockLedger.has(matId)) {
          const mat = rawMaterials.find((m) => m.id === matId);
          if (mat) {
            stockLedger.set(matId, mat.current_stock);
            requiredMap.set(matId, mat.name);
            unitMap.set(matId, mat.unit);
          }
        }
        result.push({ raw_material_id: matId, required_quantity: Number(qty.toFixed(3)) });
      });
      return result;
    };

    const orderStatusUpdates = new Map<string, { status: OrderStatus; blocked_reason?: string }>();

    candidateOrders.forEach((ord) => {
      const requirements = computeRequirements(ord.id);
      // Check suffciency against the running ledger
      const missingItems: Array<string> = [];
      const materialDeductions: Array<{ raw_material_id: string; required_quantity: number }> = [];

      requirements.forEach((req) => {
        const ledgerStock = stockLedger.get(req.raw_material_id) ?? 0;
        if (ledgerStock < req.required_quantity) {
          const name = requiredMap.get(req.raw_material_id) || 'Desconocido';
          const deficit = Number((req.required_quantity - ledgerStock).toFixed(3));
          const unit = unitMap.get(req.raw_material_id) || '';
          missingItems.push(`Falta ${name} (Déficit: ${deficit} ${unit})`);
        } else {
          materialDeductions.push(req);
        }
      });

      if (missingItems.length > 0) {
        // RN-04: Prevención - block order and do NOT deduct anything
        orderStatusUpdates.set(ord.id, {
          status: 'BLOCKED_BY_INSUMOS',
          blocked_reason: `[RN-04] Bloqueado por falta de insumos: ${missingItems.join('; ')}`
        });
      } else {
        // RN-03: Apply deductions to ledger (accumulated across the batch)
        materialDeductions.forEach((md) => {
          const current = stockLedger.get(md.raw_material_id) ?? 0;
          stockLedger.set(md.raw_material_id, Number(Math.max(0, current - md.required_quantity).toFixed(3)));
        });
        orderStatusUpdates.set(ord.id, { status: 'IN_PRODUCTION', blocked_reason: undefined });
      }
    });

    // Apply final order statuses
    setOrders((prev) =>
      prev.map((o) => {
        const update = orderStatusUpdates.get(o.id);
        if (!update) return o;
        return { ...o, status: update.status, blocked_reason: update.blocked_reason };
      })
    );

    // Apply final raw material deductions (functional update on the actual state)
    setRawMaterials((prev) =>
      prev.map((mat) => {
        const ledgerStock = stockLedger.get(mat.id);
        if (ledgerStock === undefined || ledgerStock === mat.current_stock) {
          // Unchanged material, keep original status untouched
          return mat;
        }
        const status = calculateStockStatus(ledgerStock, mat.minimum_stock);
        return { ...mat, current_stock: ledgerStock, status };
      })
    );

    let processedCount = 0;
    let blockedCount = 0;
    orderStatusUpdates.forEach((u) => {
      if (u.status === 'IN_PRODUCTION') processedCount++;
      else blockedCount++;
    });

    const summary = `Producción Diaria procesada: ${processedCount} pedidos enviados al horno/obrador, ${blockedCount} pedidos bloqueados por insumos.`;
    showToast(summary, blockedCount > 0 ? 'warning' : 'success');
    return {
      success: processedCount > 0,
      processedOrders: processedCount,
      blockedOrders: blockedCount,
      message: summary
    };
  };

  const updateSettings = (newSettings: Partial<BakerySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Configuración guardada exitosamente', 'success');
  };

  const resetToDemoData = () => {
    setProfiles(INITIAL_PROFILES);
    setUserAccounts(INITIAL_ACCOUNTS);
    setRawMaterials(INITIAL_RAW_MATERIALS);
    setProducts(INITIAL_PRODUCTS);
    setRecipeItems(INITIAL_RECIPE_ITEMS);
    setOrders(INITIAL_ORDERS);
    setOrderItems(INITIAL_ORDER_ITEMS);
    setSettings(INITIAL_SETTINGS);
    setCurrentUser(null);
    setNavigation({ currentView: 'AUTH', selectedItemId: null });
    localStorage.clear();
    showToast('Datos de muestra restablecidos. Inicie sesión para acceder al obrador.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        navigation,
        navigateTo,
        currentUser,
        switchUser,
        profiles,
        login,
        registerUser,
        logout,
        deleteUserProfile,
        rawMaterials,
        products,
        recipeItems,
        orders,
        orderItems,
        settings,
        createOrder,
        updateOrderStatus,
        processOrderProduction,
        processDailyKitchenProduction,
        recordOrderPayment,
        addRawMaterial,
        updateRawMaterial,
        restockRawMaterial,
        deleteRawMaterial,
        addProductWithRecipe,
        updateProductWithRecipe,
        deleteProduct,
        calculateProductCost,
        getRecipeExplosionForOrder,
        getRecipeExplosionForDate,
        updateSettings,
        resetToDemoData,
        toast,
        showToast,
        clearToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe usarse dentro de un AppProvider');
  }
  return context;
};
