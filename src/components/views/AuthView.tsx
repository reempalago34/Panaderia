import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  UserPlus,
  LogIn,
  LogOut,
  Eye,
  EyeOff,
  Trash2,
  User,
  Mail,
  Phone,
  Crown,
  ChefHat,
  Package,
  BadgeDollarSign,
  AlertCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const PRESET_AVATARS = [
  {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    label: 'Administración / Gerencia'
  },
  {
    url: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80',
    label: 'Maestro Panadero'
  },
  {
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    label: 'Encargada de Producción'
  },
  {
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
    label: 'Atención en Mostrador'
  },
  {
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    label: 'Pastelería Artesanal'
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    label: 'Fermentación & Masa Madre'
  }
];

export const AuthView: React.FC = () => {
  const {
    currentUser,
    profiles,
    login,
    registerUser,
    logout,
    deleteUserProfile,
    navigateTo,
    settings
  } = useApp();

  // Mode: login | register
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRole, setRegRole] = useState<UserRole>(() => (currentUser?.role === 'admin' ? 'cashier' : 'customer'));
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState(PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        // login() already navigates to the default view for the authenticated role
      } else {
        setLoginError(res.error || 'Error al iniciar sesión.');
      }
    } catch (err: any) {
      setLoginError(err?.message || 'Error inesperado en el inicio de sesión.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Submit Register
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    // Client-side validations
    if (!regFullName.trim()) {
      setRegError('Por favor, introduzca el nombre y apellidos completos.');
      return;
    }

    if (!regEmail.trim()) {
      setRegError('Por favor, introduzca un correo electrónico válido.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    setIsRegistering(true);

    try {
      const finalAvatar = customAvatarUrl.trim() || selectedAvatarUrl;
      const res = await registerUser({
        full_name: regFullName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        avatar_url: finalAvatar,
        phone: regPhone.trim() || undefined
      });

      if (res.success) {
        setRegFullName('');
        setRegEmail('');
        setRegPhone('');
        setRegPassword('');
        setRegConfirmPassword('');
        setCustomAvatarUrl('');
        // registerUser() already navigates to the default view for the new role
      } else {
        setRegError(res.error || 'Error al registrar el nuevo usuario.');
      }
    } catch (err: any) {
      setRegError(err?.message || 'Error al procesar el registro.');
    } finally {
      setIsRegistering(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <Crown className="w-3 h-3 text-purple-400" />
            <span>Administrador</span>
          </span>
        );
      case 'head_baker':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <ChefHat className="w-3 h-3 text-amber-400" />
            <span>Maestro Panadero</span>
          </span>
        );
      case 'production_manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <Package className="w-3 h-3 text-blue-400" />
            <span>Encargada de Producción</span>
          </span>
        );
      case 'cashier':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <BadgeDollarSign className="w-3 h-3 text-emerald-400" />
            <span>Atención Mostrador / Caja</span>
          </span>
        );
      case 'customer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-700 text-slate-300 border border-slate-600">
            <User className="w-3 h-3 text-slate-400" />
            <span>Cliente</span>
          </span>
        );
    }
  };

  const isSupabaseConfigured = Boolean(settings.supabase_url && settings.supabase_anon_key);

  // Only an authenticated admin may create staff/admin accounts (privilege escalation guard)
  const isAdminSession = currentUser?.role === 'admin';

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 space-y-7">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wider uppercase">
          <ShieldCheck className="w-4 h-4" />
          <span>MazaMadre Control · Sistema de Acceso</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Acceso al Obrador Artesanal
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Inicie sesión para acceder a la gestión de comandas, recetas, hornadas e inventarios.
        </p>
      </div>

      {/* Active User Card (if already logged in) */}
      {currentUser && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={currentUser.avatar_url || PRESET_AVATARS[0].url}
              alt={currentUser.full_name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-amber-500/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Sesión Actual:</span>
                <h3 className="text-base font-bold text-white">{currentUser.full_name}</h3>
                {getRoleBadge(currentUser.role)}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => navigateTo('DASHBOARD')}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/20"
            >
              <span>Ir al Panel Operativo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              title="Cerrar sesión actual"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Authentication Box */}
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-700/80 bg-slate-900/40 p-1.5 gap-1.5">
          <button
            onClick={() => {
              setActiveTab('login');
              setLoginError(null);
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Iniciar Sesión</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setRegError(null);
            }}
            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{isAdminSession ? 'Registrar Personal' : 'Registrarse / Alta Cliente'}</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Supabase / Local Storage Status Pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">
                {isSupabaseConfigured ? 'Conexión Supabase PostgreSQL Activa' : 'Almacenamiento Local Seguro'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              {isSupabaseConfigured ? 'PostgreSQL RLS' : 'MazaMadre v1.0'}
            </span>
          </div>

          {/* TAB 1: INICIAR SESIÓN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <h2 className="font-heading text-lg font-bold text-white mb-1">
                  Ingreso de Personal Autorizado
                </h2>
                <p className="text-xs text-slate-400">
                  Ingrese con su nombre de usuario o correo y contraseña de acceso.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Usuario o Correo Electrónico</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Usuario o correo electrónico"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Contraseña</span>
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-2.5 pr-11 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                      title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-[0.99]"
                >
                  {isLoggingIn ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verificando credenciales...</span>
                    </>
                  ) : (
                    <>
                      <span>Iniciar Sesión en el Obrador</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    ¿Necesita dar de alta personal? <span className="font-semibold text-amber-400 underline">Registrar nuevo usuario</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: REGISTRAR NUEVO PERSONAL */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div>
                <h2 className="font-heading text-lg font-bold text-white mb-1">
                  {isAdminSession ? 'Alta de Personal del Obrador' : 'Registro de Cliente Particular'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isAdminSession
                    ? 'Cree cuentas para panaderos, pasteleros, administradores o personal de mostrador.'
                    : 'Cree su cuenta para realizar encargos personalizados y consultar sus propios pedidos.'}
                </p>
              </div>

              {regError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nombre y Apellidos *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Valentina Ramos"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Correo Electrónico *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ej. valentina@mazamadre.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400 focus:ring-1 focus:ring-amber-400/40"
                  />
                </div>
              </div>

              {/* Phone & Role Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-amber-400" />
                    <span>Teléfono (opcional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="ej. +34 612 345 678"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Rol Asignado *</span>
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-amber-400 cursor-pointer"
                    disabled={!isAdminSession}
                  >
                    {isAdminSession ? (
                      <>
                        <option value="admin">Administrador / Propietario</option>
                        <option value="head_baker">Maestro Panadero / Jefe Obrador</option>
                        <option value="production_manager">Encargada de Producción & Almacén</option>
                        <option value="cashier">Atención Mostrador & Caja</option>
                        <option value="customer">Cliente Particular</option>
                      </>
                    ) : (
                      <option value="customer">Cliente Particular</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Avatar Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Avatar del Usuario
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                  {PRESET_AVATARS.map((avatar, idx) => {
                    const isSelected = selectedAvatarUrl === avatar.url && !customAvatarUrl;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setSelectedAvatarUrl(avatar.url);
                          setCustomAvatarUrl('');
                        }}
                        className={`p-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 ring-2 ring-amber-500/40'
                            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                        }`}
                        title={avatar.label}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.label}
                          className="w-12 h-12 rounded-lg object-cover mx-auto"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Contraseña (mínimo 6 car.) *</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Contraseña segura"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Confirmar Contraseña *</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Repita la contraseña"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-xs text-white placeholder:text-slate-500 focus:outline-hidden ${
                      regConfirmPassword && regConfirmPassword !== regPassword
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-slate-700 focus:border-amber-400'
                    }`}
                  />
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-[0.99]"
                >
                  {isRegistering ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creando cuenta de personal...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>{isAdminSession ? 'Registrar Personal y Acceder' : 'Crear Cuenta de Cliente'}</span>
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                  >
                    ¿Ya tiene cuenta? <span className="font-semibold text-amber-400 underline">Iniciar Sesión</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Team Directory (Shown when logged in as admin) */}
      {currentUser?.role === 'admin' && profiles.length > 1 && (
        <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-purple-400" />
              <h3 className="font-heading text-sm font-bold text-slate-100">
                Personal Registrado ({profiles.length} miembros)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">auth.users</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs">
            {profiles.map((p) => {
              const isCurrent = currentUser?.id === p.id;
              const canDelete = !isCurrent && p.role !== 'admin';

              return (
                <div key={p.id} className="py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={p.avatar_url}
                      alt={p.full_name}
                      className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-white font-medium block truncate">{p.full_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono block truncate">{p.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getRoleBadge(p.role)}

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Desea dar de baja a ${p.full_name}?`)) {
                            deleteUserProfile(p.id);
                          }
                        }}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
