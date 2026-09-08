import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Toast } from './components/common/Toast';
import { AuthView } from './components/views/AuthView';
import { DashboardView } from './components/views/DashboardView';
import { RawMaterialsView } from './components/views/RawMaterialsView';
import { ProductsRecipesView } from './components/views/ProductsRecipesView';
import { OrderCreateView } from './components/views/OrderCreateView';
import { OrderDetailView } from './components/views/OrderDetailView';
import { KitchenDailyView } from './components/views/KitchenDailyView';
import { SettingsView } from './components/views/SettingsView';
import { Wheat, ShieldCheck, Database, Server } from 'lucide-react';

const MainContent: React.FC = () => {
  const { navigation, currentUser, settings, navigateTo } = useApp();

  const renderView = () => {
    // If no user is logged in, show Auth / Login view directly
    if (!currentUser) {
      return <AuthView />;
    }

    switch (navigation.currentView) {
      case 'AUTH':
        return <AuthView />;
      case 'DASHBOARD':
        return <DashboardView />;
      case 'RAW_MATERIALS':
        return <RawMaterialsView />;
      case 'PRODUCTS_RECIPES':
        return <ProductsRecipesView />;
      case 'ORDER_CREATE':
        return <OrderCreateView />;
      case 'ORDER_DETAIL':
        return <OrderDetailView />;
      case 'KITCHEN_DAILY':
        return <KitchenDailyView />;
      case 'SETTINGS':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Primary Sticky Navigation */}
      <Navbar />

      {/* Dynamic View Body */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Global Feedback Toast */}
      <Toast />

      {/* Clean Operations Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0B1120] text-slate-400 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wheat className="w-4 h-4 text-amber-400" />
            <span className="font-heading font-bold text-slate-300">
              {settings.business_name}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-400">
              SaaS Multi-vista Obrador & Inventarios
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Rol: <strong className="text-slate-200 capitalize">{currentUser ? currentUser.role.replace('_', ' ') : 'Invitado'}</strong></span>
            </span>
            {currentUser?.role === 'admin' && (
              <>
                <span className="text-slate-700">|</span>
                <button
                  onClick={() => navigateTo('SETTINGS')}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  <span>PostgreSQL / Supabase RLS</span>
                </button>
              </>
            )}
            <span className="text-slate-700">|</span>
            <span className="text-slate-500">v2.4 Production Build</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
