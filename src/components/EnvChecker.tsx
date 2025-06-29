import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

const EnvChecker: React.FC = () => {
  // Só mostrar em desenvolvimento
  if (!import.meta.env.DEV) {
    return null;
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const urlValid = supabaseUrl && supabaseUrl !== 'your_supabase_project_url' && supabaseUrl.includes('supabase.co');
  const keyValid = supabaseKey && supabaseKey !== 'your_supabase_anon_key' && supabaseKey.length > 100;
  
  const allValid = urlValid && keyValid;
  const configured = isSupabaseConfigured();

  if (allValid && configured) {
    return (
      <div className="fixed top-4 right-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center z-50">
        <CheckCircle size={16} className="text-green-600 dark:text-green-400 mr-2" />
        <span className="text-sm text-green-800 dark:text-green-300">Supabase configurado ✅</span>
      </div>
    );
  }

  if (!allValid) {
    return (
      <div className="fixed top-4 right-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 max-w-md z-50">
        <div className="flex items-start">
          <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              Modo Offline - Supabase não configurado
            </h3>
            <div className="space-y-1 text-xs text-yellow-700 dark:text-yellow-400">
              <div className="flex items-center">
                {urlValid ? (
                  <CheckCircle size={12} className="text-green-500 mr-1" />
                ) : (
                  <XCircle size={12} className="text-red-500 mr-1" />
                )}
                <span>URL: {urlValid ? 'OK' : 'Inválida'}</span>
              </div>
              <div className="flex items-center">
                {keyValid ? (
                  <CheckCircle size={12} className="text-green-500 mr-1" />
                ) : (
                  <XCircle size={12} className="text-red-500 mr-1" />
                )}
                <span>Chave: {keyValid ? 'OK' : 'Inválida'}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              <p>📱 Dados salvos localmente</p>
              <p>🔧 Configure .env para usar Supabase</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default EnvChecker;