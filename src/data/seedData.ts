import { UserProfile, UserAccount, RawMaterial, Product, RecipeItem, Order, OrderItem, BakerySettings } from '../types';
import { HASHED_ADMIN_PASSWORD } from '../utils/passwordHash';

export const DEFAULT_ADMIN_USERNAME = 'Admin';
export const DEFAULT_ADMIN_PASSWORD = 'Admin123';
export const DEFAULT_DEMO_PASSWORD = 'Admin123';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'usr-admin-01',
    email: 'admin@mazamadre.com',
    full_name: 'Administrador',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    created_at: '2026-01-10T08:00:00Z'
  }
];

export const INITIAL_ACCOUNTS: UserAccount[] = [
  {
    ...INITIAL_PROFILES[0],
    password: HASHED_ADMIN_PASSWORD
  }
];

export const INITIAL_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'mat-001',
    sku: 'INS-HAR-01',
    name: 'Harina de Trigo Gran Fuerza W300',
    category: 'harinas',
    unit: 'kg',
    current_stock: 350.0,
    minimum_stock: 80.0,
    cost_per_unit: 1.15,
    supplier: 'Molinos del Duero Ecológicos',
    last_restocked_at: '2026-08-30T10:00:00Z',
    status: 'OPTIMAL'
  },
  {
    id: 'mat-002',
    sku: 'INS-HAR-02',
    name: 'Harina Integral de Molino de Piedra',
    category: 'harinas',
    unit: 'kg',
    current_stock: 120.0,
    minimum_stock: 40.0,
    cost_per_unit: 1.45,
    supplier: 'Molinos del Duero Ecológicos',
    last_restocked_at: '2026-08-28T09:00:00Z',
    status: 'OPTIMAL'
  },
  {
    id: 'mat-003',
    sku: 'INS-HAR-03',
    name: 'Harina de Centeno Integral T130',
    category: 'harinas',
    unit: 'kg',
    current_stock: 18.5,
    minimum_stock: 30.0,
    cost_per_unit: 1.60,
    supplier: 'Harinas Tradicionales del Norte',
    last_restocked_at: '2026-08-20T14:30:00Z',
    status: 'CRITICAL'
  },
  {
    id: 'mat-004',
    sku: 'INS-MAS-01',
    name: 'Masa Madre Viva San Telmo (Cepa Madre)',
    category: 'levaduras_masa',
    unit: 'kg',
    current_stock: 45.0,
    minimum_stock: 15.0,
    cost_per_unit: 0.60,
    supplier: 'Obrador Interno',
    last_restocked_at: '2026-09-02T06:00:00Z',
    status: 'OPTIMAL'
  },
  {
    id: 'mat-005',
    sku: 'INS-GRA-01',
    name: 'Mantequilla de Normandía AOP 82%',
    category: 'grasas',
    unit: 'kg',
    current_stock: 14.0,
    minimum_stock: 25.0,
    cost_per_unit: 9.80,
    supplier: 'Lácteos L\'Artisan',
    last_restocked_at: '2026-08-25T11:00:00Z',
    status: 'CRITICAL'
  },
  {
    id: 'mat-006',
    sku: 'INS-LAC-01',
    name: 'Leche Fresca Entera de Granja',
    category: 'lacteos',
    unit: 'l',
    current_stock: 40.0,
    minimum_stock: 20.0,
    cost_per_unit: 1.30,
    supplier: 'Granjas La Campiña',
    last_restocked_at: '2026-09-01T08:00:00Z',
    status: 'OPTIMAL'
  },
  {
    id: 'mat-007',
    sku: 'INS-AZU-01',
    name: 'Chocolate Negro Puro Valrhona 70%',
    category: 'azucares_chocolates',
    unit: 'kg',
    current_stock: 22.0,
    minimum_stock: 10.0,
    cost_per_unit: 14.50,
    supplier: 'Chocolates Valrhona España',
    last_restocked_at: '2026-08-22T16:00:00Z',
    status: 'OPTIMAL'
  },
  {
    id: 'mat-008',
    sku: 'INS-LAC-02',
    name: 'Queso Crema San Simón para Tarta',
    category: 'lacteos',
    unit: 'kg',
    current_stock: 3.5,
    minimum_stock: 12.0,
    cost_per_unit: 8.20,
    supplier: 'Lácteos L\'Artisan',
    last_restocked_at: '2026-08-20T10:00:00Z',
    status: 'CRITICAL'
  },
  {
    id: 'mat-009',
    sku: 'INS-HUE-01',
    name: 'Huevos Camperos Granja Frescos',
    category: 'otros',
    unit: 'ud',
    current_stock: 280,
    minimum_stock: 100,
    cost_per_unit: 0.28,
    supplier: 'Avícola Santa Ana',
    last_restocked_at: '2026-09-01T07:30:00Z',
    status: 'OPTIMAL'
  },
  {
    id: 'mat-010',
    sku: 'INS-FRU-01',
    name: 'Mix de Semillas Tostadas (Chía, Lino, Sésamo)',
    category: 'frutos_semillas',
    unit: 'kg',
    current_stock: 0.0,
    minimum_stock: 10.0,
    cost_per_unit: 4.80,
    supplier: 'Frutos Secos La Montaña',
    last_restocked_at: '2026-08-10T12:00:00Z',
    status: 'OUT_OF_STOCK'
  },
  {
    id: 'mat-011',
    sku: 'INS-SAL-01',
    name: 'Sal Marina Fina del Delta del Ebro',
    category: 'otros',
    unit: 'kg',
    current_stock: 75.0,
    minimum_stock: 20.0,
    cost_per_unit: 0.45,
    supplier: 'Salinas Mediterráneas',
    last_restocked_at: '2026-08-15T09:00:00Z',
    status: 'OPTIMAL'
  },
  {
    id: 'mat-012',
    sku: 'INS-EMP-01',
    name: 'Cajas Kraft para Tartas 28cm',
    category: 'empaques',
    unit: 'ud',
    current_stock: 85,
    minimum_stock: 30,
    cost_per_unit: 0.95,
    supplier: 'Envases Sostenibles EcoPack',
    last_restocked_at: '2026-08-26T15:00:00Z',
    status: 'OPTIMAL'
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'PROD-HOG-01',
    name: 'Hogaza Tradicional de Masa Madre 36h',
    category: 'panaderia',
    description: 'Nuestra hogaza insigne con 36 horas de fermentación en frío, corteza caramelizada y miga alveolada.',
    price: 4.80,
    preparation_time_hours: 36,
    portions_or_weight: '850 g',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-002',
    sku: 'PROD-CRO-01',
    name: 'Croissant Artesano de Mantequilla AOP',
    category: 'viennoiserie',
    description: 'Hojaldrado clásico con 27 capas perfectas de mantequilla de Normandía, alveolado esponjoso.',
    price: 2.30,
    preparation_time_hours: 18,
    portions_or_weight: '90 g',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-003',
    sku: 'PROD-CHO-01',
    name: 'Pain au Chocolat Doble Barra Valrhona',
    category: 'viennoiserie',
    description: 'Masa hojaldrada crujiente rellena de dos barras de chocolate negro 70% Valrhona.',
    price: 2.70,
    preparation_time_hours: 18,
    portions_or_weight: '105 g',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-004',
    sku: 'PROD-TAR-01',
    name: 'Tarta Vasca de Queso Cremoso (Grande)',
    category: 'pasteleria',
    description: 'Tarta de queso tostada por fuera con corazón fluido y ultra cremoso de queso artesanal.',
    price: 32.00,
    preparation_time_hours: 6,
    portions_or_weight: '10-12 porciones (1.4 kg)',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-005',
    sku: 'PROD-CEN-01',
    name: 'Pan de Centeno Nórdico y Semillas',
    category: 'panaderia',
    description: 'Pan denso y aromático de centeno integral T130 cubierto de semillas tostadas.',
    price: 5.40,
    preparation_time_hours: 24,
    portions_or_weight: '900 g',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-006',
    sku: 'PROD-BAG-01',
    name: 'Baguette Tradición Francesa',
    category: 'panaderia',
    description: 'Elaborada con harina sin aditivos, hidratación del 75% y horneado sobre piedra volcánica.',
    price: 1.80,
    preparation_time_hours: 12,
    portions_or_weight: '320 g',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 'prod-007',
    sku: 'PROD-BRI-01',
    name: 'Corona Brioche Trenzada de Canela',
    category: 'pasteleria',
    description: 'Brioche enriquecido con mantequilla y huevos camperos con relleno de canela de Ceilán.',
    price: 9.50,
    preparation_time_hours: 14,
    portions_or_weight: '550 g',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=600&q=80'
  }
];

export const INITIAL_RECIPE_ITEMS: RecipeItem[] = [
  // Hogaza Tradicional (prod-001)
  { id: 'rec-001', product_id: 'prod-001', raw_material_id: 'mat-001', quantity: 0.52, unit: 'kg', notes: 'Harina W300 base' },
  { id: 'rec-002', product_id: 'prod-001', raw_material_id: 'mat-004', quantity: 0.16, unit: 'kg', notes: 'Masa madre refrescada' },
  { id: 'rec-003', product_id: 'prod-001', raw_material_id: 'mat-011', quantity: 0.012, unit: 'kg', notes: 'Sal fina' },

  // Croissant Mantequilla (prod-002)
  { id: 'rec-004', product_id: 'prod-002', raw_material_id: 'mat-001', quantity: 0.055, unit: 'kg', notes: 'Harina laminado' },
  { id: 'rec-005', product_id: 'prod-002', raw_material_id: 'mat-005', quantity: 0.038, unit: 'kg', notes: 'Mantequilla AOP hojaldrado' },
  { id: 'rec-006', product_id: 'prod-002', raw_material_id: 'mat-006', quantity: 0.02, unit: 'l', notes: 'Leche entera masa' },
  { id: 'rec-007', product_id: 'prod-002', raw_material_id: 'mat-011', quantity: 0.002, unit: 'kg', notes: 'Sal' },

  // Pain au Chocolat (prod-003)
  { id: 'rec-008', product_id: 'prod-003', raw_material_id: 'mat-001', quantity: 0.06, unit: 'kg', notes: 'Harina' },
  { id: 'rec-009', product_id: 'prod-003', raw_material_id: 'mat-005', quantity: 0.035, unit: 'kg', notes: 'Mantequilla laminado' },
  { id: 'rec-010', product_id: 'prod-003', raw_material_id: 'mat-007', quantity: 0.025, unit: 'kg', notes: '2 barras Valrhona 70%' },

  // Tarta Vasca (prod-004)
  { id: 'rec-011', product_id: 'prod-004', raw_material_id: 'mat-008', quantity: 0.85, unit: 'kg', notes: 'Queso crema de granja' },
  { id: 'rec-012', product_id: 'prod-004', raw_material_id: 'mat-009', quantity: 6, unit: 'ud', notes: 'Huevos camperos' },
  { id: 'rec-013', product_id: 'prod-004', raw_material_id: 'mat-006', quantity: 0.45, unit: 'l', notes: 'Nata/Leche' },
  { id: 'rec-014', product_id: 'prod-004', raw_material_id: 'mat-012', quantity: 1, unit: 'ud', notes: 'Caja Kraft 28cm' },

  // Pan de Centeno y Semillas (prod-005)
  { id: 'rec-015', product_id: 'prod-005', raw_material_id: 'mat-003', quantity: 0.45, unit: 'kg', notes: 'Harina de centeno T130' },
  { id: 'rec-016', product_id: 'prod-005', raw_material_id: 'mat-001', quantity: 0.18, unit: 'kg', notes: 'Harina de fuerza' },
  { id: 'rec-017', product_id: 'prod-005', raw_material_id: 'mat-004', quantity: 0.15, unit: 'kg', notes: 'Masa madre' },
  { id: 'rec-018', product_id: 'prod-005', raw_material_id: 'mat-010', quantity: 0.07, unit: 'kg', notes: 'Mix de semillas tostadas' },

  // Baguette Tradición (prod-006)
  { id: 'rec-019', product_id: 'prod-006', raw_material_id: 'mat-001', quantity: 0.22, unit: 'kg', notes: 'Harina sin aditivos' },
  { id: 'rec-020', product_id: 'prod-006', raw_material_id: 'mat-004', quantity: 0.04, unit: 'kg', notes: 'Poolish / MM' },
  { id: 'rec-021', product_id: 'prod-006', raw_material_id: 'mat-011', quantity: 0.005, unit: 'kg', notes: 'Sal' },

  // Corona Brioche (prod-007)
  { id: 'rec-022', product_id: 'prod-007', raw_material_id: 'mat-001', quantity: 0.32, unit: 'kg', notes: 'Harina' },
  { id: 'rec-023', product_id: 'prod-007', raw_material_id: 'mat-005', quantity: 0.12, unit: 'kg', notes: 'Mantequilla pomada' },
  { id: 'rec-024', product_id: 'prod-007', raw_material_id: 'mat-009', quantity: 3, unit: 'ud', notes: 'Huevos' }
];

// Helper to get dates relative to today
const getOffsetDate = (daysOffset: number, hoursOffset: number = 10): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(hoursOffset, 0, 0, 0);
  return d.toISOString();
};

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-001',
    order_number: 'ORD-2026-0101',
    customer_name: 'Restaurante El Laurel',
    customer_phone: '+34 611 223 344',
    customer_email: 'compras@ellaurel.com',
    created_at: getOffsetDate(-2, 11),
    delivery_date: getOffsetDate(0, 8), // Hoy a las 08:00
    status: 'IN_PRODUCTION',
    total_amount: 57.60,
    deposit_amount: 35.00, // > 50%
    remaining_balance: 22.60,
    payment_method: 'transferencia',
    notes: 'Entregar antes de las 08:30 para el pase de desayunos.'
  },
  {
    id: 'ord-002',
    order_number: 'ORD-2026-0102',
    customer_name: 'Marta Soler Puig',
    customer_phone: '+34 622 998 877',
    customer_email: 'marta.soler@gmail.com',
    created_at: getOffsetDate(-1, 15),
    delivery_date: getOffsetDate(1, 11), // Mañana a las 11:00
    status: 'CONFIRMED',
    total_amount: 64.00,
    deposit_amount: 32.00, // Exacto 50%
    remaining_balance: 32.00,
    payment_method: 'bizum',
    notes: '2 Tartas Vascas. Poner dedicatoria: "Felicidades Jordi".'
  },
  {
    id: 'ord-003',
    order_number: 'ORD-2026-0103',
    customer_name: 'Café & Brasa Atelier',
    customer_phone: '+34 677 334 455',
    customer_email: 'contacto@cafebrasa.es',
    created_at: getOffsetDate(-1, 10),
    delivery_date: getOffsetDate(1, 7), // Mañana a las 07:00
    status: 'CONFIRMED',
    total_amount: 46.00,
    deposit_amount: 30.00, // > 50%
    remaining_balance: 16.00,
    payment_method: 'tarjeta',
    notes: '20 Croissants artesanos de mantequilla recién horneados.'
  },
  {
    id: 'ord-004',
    order_number: 'ORD-2026-0104',
    customer_name: 'David Alarcón',
    customer_phone: '+34 688 123 789',
    customer_email: 'david.alarcon@live.com',
    created_at: getOffsetDate(-3, 16),
    delivery_date: getOffsetDate(0, 12), // Hoy a las 12:00
    status: 'READY',
    total_amount: 28.80,
    deposit_amount: 20.00,
    remaining_balance: 8.80,
    payment_method: 'bizum',
    notes: 'Cliente pasará a recoger en mostrador con caja de madera.'
  },
  {
    id: 'ord-005',
    order_number: 'ORD-2026-0105',
    customer_name: 'Hotel Boutique Casa San Pedro',
    customer_phone: '+34 933 555 444',
    customer_email: 'fnb@casasanpedro.com',
    created_at: getOffsetDate(-4, 9),
    delivery_date: getOffsetDate(-1, 8),
    status: 'DELIVERED',
    total_amount: 115.00,
    deposit_amount: 60.00,
    remaining_balance: 0.00, // Cobrado completo
    payment_method: 'transferencia',
    notes: 'Pedido recurrente semanal entregado con éxito.'
  },
  {
    id: 'ord-006',
    order_number: 'ORD-2026-0106',
    customer_name: 'Gourmet Club Diagonal',
    customer_phone: '+34 644 112 233',
    customer_email: 'eventos@gourmetdiagonal.com',
    created_at: getOffsetDate(0, 9),
    delivery_date: getOffsetDate(2, 18), // En 2 días
    status: 'BLOCKED_BY_INSUMOS',
    total_amount: 81.00,
    deposit_amount: 50.00,
    remaining_balance: 31.00,
    payment_method: 'tarjeta',
    notes: '15 Panes de Centeno y Semillas para catering degustación.',
    blocked_reason: 'Falta stock crítico de "Mix de Semillas Tostadas" (Stock actual: 0.0 kg, requerido: 1.05 kg) y "Harina de Centeno Integral T130" insuficiente.'
  }
];

export const INITIAL_ORDER_ITEMS: OrderItem[] = [
  // Ord 001: 12 Hogazas Tradicionales (12 * 4.80 = 57.60)
  { id: 'item-001', order_id: 'ord-001', product_id: 'prod-001', quantity: 12, unit_price: 4.80, subtotal: 57.60 },

  // Ord 002: 2 Tartas Vascas (2 * 32.00 = 64.00)
  { id: 'item-002', order_id: 'ord-002', product_id: 'prod-004', quantity: 2, unit_price: 32.00, subtotal: 64.00 },

  // Ord 003: 20 Croissants (20 * 2.30 = 46.00)
  { id: 'item-003', order_id: 'ord-003', product_id: 'prod-002', quantity: 20, unit_price: 2.30, subtotal: 46.00 },

  // Ord 004: 6 Hogazas (6 * 4.80 = 28.80)
  { id: 'item-004', order_id: 'ord-004', product_id: 'prod-001', quantity: 6, unit_price: 4.80, subtotal: 28.80 },

  // Ord 005: 50 Croissants (50 * 2.30 = 115.00)
  { id: 'item-005', order_id: 'ord-005', product_id: 'prod-002', quantity: 50, unit_price: 2.30, subtotal: 115.00 },

  // Ord 006: 15 Panes de Centeno y Semillas (15 * 5.40 = 81.00)
  { id: 'item-006', order_id: 'ord-006', product_id: 'prod-005', quantity: 15, unit_price: 5.40, subtotal: 81.00 }
];

export const INITIAL_SETTINGS: BakerySettings = {
  name: 'MazaMadre Control',
  business_name: 'MazaMadre Control - Obrador Artesanal',
  legal_name: 'Obrador Artesanal MazaMadre S.L.',
  tax_id: 'B-67890123',
  address: 'Calle Mayor del Obrador 24, Barrio Tradicional',
  phone: '+34 932 456 789',
  email: 'administracion@mazamadre.com',
  minimum_deposit_percentage: 50,
  minimum_advance_hours: 24,
  currency_symbol: '€',
  supabase_url: '',
  supabase_anon_key: '',
  is_supabase_connected: false
};
