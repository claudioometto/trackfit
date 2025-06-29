import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SignUpData, UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (signUpData: SignUpData) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (userId: string, retryCount = 0) => {
    if (!isSupabaseConfigured()) return;

    try {
      console.log(`🔍 Carregando perfil para usuário: ${userId} (tentativa ${retryCount + 1})`);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Erro ao carregar perfil:', error);
        return;
      }

      if (data) {
        console.log('✅ Perfil carregado:', data);
        setUserProfile(data);
      } else {
        console.log('⚠️ Nenhum perfil encontrado para o usuário');
        setUserProfile(null);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao carregar perfil:', error);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Erro ao obter sessão inicial:', error);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        console.log('👤 Usuário encontrado na sessão:', session.user.email);
        loadUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.email);
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);

      // Handle successful sign in
      if (event === 'SIGNED_IN' && session) {
        console.log('✅ Usuário logado:', session.user.email);
      }

      // Handle sign out
      if (event === 'SIGNED_OUT') {
        console.log('👋 Usuário deslogado');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const createUserProfile = async (userId: string, signUpData: SignUpData, retryCount = 0) => {
    if (!isSupabaseConfigured()) {
      console.log('⚠️ Supabase não configurado - perfil não será salvo');
      return;
    }

    const maxRetries = 3;
    const retryDelay = 1000; // 1 segundo

    try {
      console.log(`📝 Criando perfil para usuário: ${userId} (tentativa ${retryCount + 1}/${maxRetries})`);
      console.log('📋 Dados do perfil:', signUpData);

      // Aguardar um pouco para garantir que a sessão está ativa
      if (retryCount === 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const profileData = {
        user_id: userId,
        full_name: signUpData.fullName,
        birth_date: signUpData.birthDate,
        gender: signUpData.gender,
        height: signUpData.height,
        weight: signUpData.weight,
        neck_measurement: signUpData.neckMeasurement,
        waist_measurement: signUpData.waistMeasurement,
        hip_measurement: signUpData.hipMeasurement || null,
        main_goal: signUpData.mainGoal,
      };

      console.log('💾 Inserindo dados no Supabase:', profileData);

      const { data, error } = await supabase
        .from('user_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) {
        console.error(`❌ Erro ao criar perfil no Supabase (tentativa ${retryCount + 1}):`, error);
        console.error('📊 Detalhes do erro:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        // Retry logic para erros temporários
        if (retryCount < maxRetries - 1 && (
          error.code === '401' || // Unauthorized
          error.code === '406' || // Not Acceptable
          error.message.includes('JWT') ||
          error.message.includes('session')
        )) {
          console.log(`🔄 Tentando novamente em ${retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return createUserProfile(userId, signUpData, retryCount + 1);
        }
        
        return;
      }

      console.log('✅ Perfil criado com sucesso:', data);
      setUserProfile(data);
    } catch (error) {
      console.error(`❌ Erro inesperado ao criar perfil (tentativa ${retryCount + 1}):`, error);
      
      // Retry para erros de rede
      if (retryCount < maxRetries - 1) {
        console.log(`🔄 Tentando novamente em ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return createUserProfile(userId, signUpData, retryCount + 1);
      }
    }
  };

  const signUp = async (signUpData: SignUpData) => {
    try {
      console.log('🚀 === INICIANDO SIGNUP ===');
      console.log('📧 Email:', signUpData.email);
      console.log('🔒 Password definida:', !!signUpData.password);
      console.log('📋 Dados completos:', {
        fullName: signUpData.fullName,
        email: signUpData.email,
        password: signUpData.password ? '***definida***' : 'UNDEFINED',
        birthDate: signUpData.birthDate,
        gender: signUpData.gender,
        height: signUpData.height,
        weight: signUpData.weight,
        neckMeasurement: signUpData.neckMeasurement,
        waistMeasurement: signUpData.waistMeasurement,
        hipMeasurement: signUpData.hipMeasurement,
        mainGoal: signUpData.mainGoal
      });

      // Validação crítica antes de enviar
      if (!signUpData.email || !signUpData.password) {
        console.error('❌ ERRO CRÍTICO: Email ou senha estão vazios!');
        return { 
          error: { 
            message: 'Email e senha são obrigatórios',
            name: 'ValidationError'
          } as AuthError 
        };
      }

      if (!signUpData.email.includes('@')) {
        console.error('❌ ERRO: Email inválido!');
        return { 
          error: { 
            message: 'Email inválido',
            name: 'ValidationError'
          } as AuthError 
        };
      }

      if (signUpData.password.length < 6) {
        console.error('❌ ERRO: Senha muito curta!');
        return { 
          error: { 
            message: 'Senha deve ter pelo menos 6 caracteres',
            name: 'ValidationError'
          } as AuthError 
        };
      }

      console.log('✅ Validações passaram - enviando para Supabase...');

      const { data, error } = await supabase.auth.signUp({
        email: signUpData.email,
        password: signUpData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: signUpData.fullName,
          }
        }
      });

      if (error) {
        console.error('❌ Erro no signup:', error);
        console.error('📊 Detalhes do erro:', {
          name: error.name,
          message: error.message,
          status: error.status
        });
        
        // Mensagens de erro mais amigáveis
        if (error.message.includes('User already registered')) {
          return { error: { ...error, message: 'Este email já está cadastrado' } };
        }
        if (error.message.includes('Invalid email')) {
          return { error: { ...error, message: 'Email inválido' } };
        }
        if (error.message.includes('Password should be at least')) {
          return { error: { ...error, message: 'Senha deve ter pelo menos 6 caracteres' } };
        }
        if (error.message.includes('Anonymous sign-ins are disabled')) {
          return { error: { ...error, message: 'Erro de configuração. Verifique se o email e senha estão preenchidos corretamente.' } };
        }
        
        return { error };
      }

      console.log('✅ Signup realizado com sucesso:', data);
      console.log('👤 Usuário criado:', data.user?.email);

      // Criar perfil do usuário se o signup foi bem-sucedido
      if (data.user && !error) {
        console.log('👤 Criando perfil para usuário:', data.user.id);
        
        // Aguardar um pouco para garantir que o usuário está totalmente criado
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Criar perfil com retry logic
        await createUserProfile(data.user.id, signUpData);
      }

      return { error: null };
    } catch (error) {
      console.error('❌ Erro inesperado no signup:', error);
      
      // Tratar erro de rede
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { 
          error: { 
            message: 'Erro de conexão. Verifique sua internet e as configurações do Supabase.',
            name: 'NetworkError'
          } as AuthError 
        };
      }
      
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Tentando login para:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          return { error: { ...error, message: 'Email ou senha incorretos' } };
        }
        
        return { error };
      }

      console.log('✅ Login realizado com sucesso:', data.user?.email);
      return { error: null };
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { 
          error: { 
            message: 'Erro de conexão. Verifique sua internet e as configurações do Supabase.',
            name: 'NetworkError'
          } as AuthError 
        };
      }
      
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log('👋 Fazendo logout...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erro no logout:', error);
        return { error };
      }

      console.log('✅ Logout realizado com sucesso');
      return { error: null };
    } catch (error) {
      console.error('❌ Erro inesperado no logout:', error);
      return { error: error as AuthError };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔄 Enviando reset de senha para:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        console.error('❌ Erro no reset de senha:', error);
        return { error };
      }

      console.log('✅ Email de reset enviado com sucesso');
      return { error: null };
    } catch (error) {
      console.error('❌ Erro inesperado no reset:', error);
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (profileUpdates: Partial<UserProfile>) => {
    if (!user || !isSupabaseConfigured()) {
      return { error: new Error('Usuário não autenticado ou Supabase não configurado') };
    }

    try {
      console.log('📝 Atualizando perfil:', profileUpdates);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileUpdates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        return { error: new Error(error.message) };
      }

      console.log('✅ Perfil atualizado:', data);
      setUserProfile(data);
      return { error: null };
    } catch (error) {
      console.error('❌ Erro inesperado ao atualizar perfil:', error);
      return { error: error as Error };
    }
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};