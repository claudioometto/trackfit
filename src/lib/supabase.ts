import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis estão configuradas
const hasValidConfig = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' && 
  supabaseAnonKey !== 'your_supabase_anon_key' &&
  supabaseUrl.includes('supabase.co');

if (!hasValidConfig) {
  console.warn('⚠️ Supabase não configurado - usando modo offline');
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: hasValidConfig,
      persistSession: hasValidConfig,
      detectSessionInUrl: hasValidConfig,
      flowType: 'pkce'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Função para verificar se o Supabase está configurado
export const isSupabaseConfigured = () => hasValidConfig;

// Test connection apenas se configurado
if (hasValidConfig) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('❌ Erro de conexão Supabase:', error.message);
    } else {
      console.log('✅ Supabase conectado com sucesso');
    }
  }).catch(() => {
    console.warn('⚠️ Supabase indisponível - usando modo offline');
  });
}

export type { Database } from './database.types';