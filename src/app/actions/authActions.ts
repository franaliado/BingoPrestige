'use server';

import { createClient } from '@/lib/supabase/server';
import { Profile, Wallet } from '@/lib/types/database';

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: {
    id: string;
    email: string;
    profile: Profile | null;
    wallet: Wallet | null;
  } | null;
}

const isPlaceholderConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !url || url.includes('placeholder.supabase.co');
};

/**
 * Server Action: Iniciar Sesión en Salón VIP
 */
export async function signInAction(formData: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { email, password } = formData;

  if (!email || !password) {
    return { success: false, error: 'Por favor, completa correo y contraseña' };
  }

  // Modo Demo / Fallback si aún no se configuran las credenciales en .env.local
  if (isPlaceholderConfig()) {
    const mockUser = {
      id: 'demo-vip-user-001',
      email,
      profile: {
        id: 'demo-vip-user-001',
        username: email.split('@')[0] || 'VipPlayer',
        full_name: 'Miembro Prestige',
        avatar_url: null,
        vip_level: 1,
        is_admin: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      wallet: {
        id: 'demo-wallet-001',
        user_id: 'demo-vip-user-001',
        balance: 100.0,
        bonus_balance: 0.0,
        currency: 'USD',
        updated_at: new Date().toISOString(),
      },
    };
    return {
      success: true,
      message: 'Sesión VIP iniciada correctamente (Modo Salón Demo)',
      user: mockUser,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Obtener Perfil y Billetera
    const [profileRes, walletRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', data.user.id).single(),
      supabase.from('wallets').select('*').eq('user_id', data.user.id).single(),
    ]);

    return {
      success: true,
      message: 'Bienvenido al Salón VIP Prestige',
      user: {
        id: data.user.id,
        email: data.user.email || '',
        profile: profileRes.data || null,
        wallet: walletRes.data || null,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión';
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Registro de Membresía VIP Exclusiva
 * NOTA: Cero bono de bienvenida por exigencia de diseño. Saldo inicial 0.00.
 */
export async function signUpAction(formData: {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}): Promise<AuthResponse> {
  const { email, password, username, fullName } = formData;

  if (!email || !password || !username) {
    return { success: false, error: 'Todos los campos son obligatorios' };
  }

  if (password.length < 6) {
    return { success: false, error: 'La contraseña debe contener al menos 6 caracteres' };
  }

  // Modo Demo / Fallback si aún no se configuran las credenciales en .env.local
  if (isPlaceholderConfig()) {
    return {
      success: true,
      message: 'Membresía VIP creada con éxito. Saldo inicial: $0.00 USD (sin bono de bienvenida).',
      user: {
        id: 'new-vip-user-' + Date.now(),
        email,
        profile: {
          id: 'new-vip-user-' + Date.now(),
          username,
          full_name: fullName || username,
          avatar_url: null,
          vip_level: 1,
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        wallet: {
          id: 'wallet-' + Date.now(),
          user_id: 'new-vip-user-' + Date.now(),
          balance: 0.0,
          bonus_balance: 0.0,
          currency: 'USD',
          updated_at: new Date().toISOString(),
        },
      },
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName || username,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message:
        'Registro exitoso en Bingo Prestige. Por favor, verifica tu correo si la confirmación está activada.',
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email || '',
            profile: null,
            wallet: null,
          }
        : null,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al registrar nuevo usuario VIP';
    return { success: false, error: msg };
  }
}

/**
 * Server Action: Cerrar Sesión VIP
 */
export async function signOutAction(): Promise<{ success: boolean }> {
  try {
    if (!isPlaceholderConfig()) {
      const supabase = await createClient();
      await supabase.auth.signOut();
    }
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Server Action: Obtener la sesión y estado financiero actual del usuario
 */
export async function getCurrentUserAction(): Promise<AuthResponse> {
  if (isPlaceholderConfig()) {
    return {
      success: true,
      user: null,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return { success: false, user: null };
    }

    const [profileRes, walletRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('wallets').select('*').eq('user_id', user.id).single(),
    ]);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email || '',
        profile: profileRes.data || null,
        wallet: walletRes.data || null,
      },
    };
  } catch {
    return { success: false, user: null };
  }
}

