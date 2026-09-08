import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabaseClient = (url?: string, key?: string): SupabaseClient | null => {
  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
      return supabaseInstance;
    } catch (e) {
      console.error('Error al inicializar cliente Supabase:', e);
      return null;
    }
  }
  return supabaseInstance;
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  try {
    const client = createClient(url, key);
    const { error } = await client.from('raw_materials').select('id').limit(1);
    if (error) {
      // If table doesn't exist yet, but connection authenticated
      if (error.code === '42P01') {
        return { success: true, message: 'Conexión a Supabase exitosa (Las tablas aún no han sido migradas).' };
      }
      return { success: false, message: `Error de Supabase: ${error.message}` };
    }
    return { success: true, message: '¡Conexión y lectura de tablas en Supabase exitosa!' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Error de red o credenciales inválidas' };
  }
};

export const supabaseSignIn = async (url: string, key: string, email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> => {
  try {
    const client = createClient(url, key);
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al conectar con Supabase Auth' };
  }
};

export const supabaseSignUp = async (
  url: string,
  key: string,
  email: string,
  password: string,
  userData: { full_name: string; role: string }
): Promise<{ success: boolean; error?: string; user?: any }> => {
  try {
    const client = createClient(url, key);
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al registrar en Supabase Auth' };
  }
};
