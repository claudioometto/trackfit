import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { SignUpData } from '../types';
import { 
  Dumbbell, 
  Mail, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  ArrowLeft, 
  Loader2, 
  Eye, 
  EyeOff,
  Calendar,
  Users,
  Ruler,
  Scale,
  Target
} from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'forgot-password';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [signUpData, setSignUpData] = useState<SignUpData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    birthDate: '',
    gender: 'masculino',
    height: 0,
    weight: 0,
    neckMeasurement: 0,
    waistMeasurement: 0,
    hipMeasurement: undefined,
    mainGoal: 'ganhar_massa'
  });
  const [forgotEmail, setForgotEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const { signIn, signUp, resetPassword, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const resetForm = () => {
    setLoginData({ email: '', password: '' });
    setSignUpData({
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      birthDate: '',
      gender: 'masculino',
      height: 0,
      weight: 0,
      neckMeasurement: 0,
      waistMeasurement: 0,
      hipMeasurement: undefined,
      mainGoal: 'ganhar_massa'
    });
    setForgotEmail('');
    setError(null);
    setSuccess(null);
  };

  const handleModeChange = (newMode: AuthMode) => {
    setMode(newMode);
    resetForm();
  };

  const validateSignUp = () => {
    console.log('🔍 Validando cadastro completo:', signUpData);

    // Validações da primeira parte (dados pessoais)
    if (!signUpData.fullName.trim()) {
      setError('Nome completo é obrigatório');
      return false;
    }
    if (signUpData.fullName.trim().length < 2) {
      setError('Nome deve ter pelo menos 2 caracteres');
      return false;
    }
    if (!signUpData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signUpData.email)) {
      setError('Email inválido');
      return false;
    }
    if (!signUpData.password) {
      setError('Senha é obrigatória');
      return false;
    }
    if (signUpData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      setError('Senhas não coincidem');
      return false;
    }
    if (!signUpData.birthDate) {
      setError('Data de nascimento é obrigatória');
      return false;
    }
    
    // Validar idade mínima (13 anos)
    const birthDate = new Date(signUpData.birthDate);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      setError('Você deve ter pelo menos 13 anos');
      return false;
    }

    // Validações da segunda parte (dados corporais)
    if (!signUpData.height || signUpData.height < 100 || signUpData.height > 250) {
      setError('Altura deve estar entre 100 e 250 cm');
      return false;
    }
    if (!signUpData.weight || signUpData.weight < 30 || signUpData.weight > 300) {
      setError('Peso deve estar entre 30 e 300 kg');
      return false;
    }
    if (!signUpData.neckMeasurement || signUpData.neckMeasurement < 20 || signUpData.neckMeasurement > 60) {
      setError('Medida do pescoço deve estar entre 20 e 60 cm');
      return false;
    }
    if (!signUpData.waistMeasurement || signUpData.waistMeasurement < 50 || signUpData.waistMeasurement > 200) {
      setError('Medida da cintura deve estar entre 50 e 200 cm');
      return false;
    }
    if (signUpData.hipMeasurement && (signUpData.hipMeasurement < 50 || signUpData.hipMeasurement > 200)) {
      setError('Medida do quadril deve estar entre 50 e 200 cm');
      return false;
    }
    
    console.log('✅ Todas as validações passaram');
    return true;
  };

  const validateLogin = () => {
    if (!loginData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    if (!loginData.password) {
      setError('Senha é obrigatória');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    console.log('🚀 Iniciando submit - Mode:', mode);

    if (mode === 'login') {
      if (!validateLogin()) return;
    } else if (mode === 'signup') {
      if (!validateSignUp()) return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        console.log('🔑 Tentando login com:', loginData.email);
        const { error } = await signIn(loginData.email, loginData.password);
        if (error) {
          setError(error.message);
        }
      } else if (mode === 'signup') {
        console.log('🚀 Enviando cadastro completo:', {
          email: signUpData.email,
          fullName: signUpData.fullName,
          hasPassword: !!signUpData.password
        });
        
        const { error } = await signUp(signUpData);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Conta criada com sucesso! Você já pode fazer login.');
          setTimeout(() => {
            setMode('login');
            setSuccess(null);
            resetForm();
          }, 2000);
        }
      } else if (mode === 'forgot-password') {
        const { error } = await resetPassword(forgotEmail);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Link de redefinição enviado para seu email!');
          setTimeout(() => {
            setMode('login');
            setSuccess(null);
          }, 3000);
        }
      }
    } catch (err) {
      setError('Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'login': return 'Entrar no TrackFit';
      case 'signup': return 'Criar Conta';
      case 'forgot-password': return 'Recuperar Senha';
      default: return '';
    }
  };

  const getButtonText = () => {
    switch (mode) {
      case 'login': return 'Entrar';
      case 'signup': return 'Criar Conta';
      case 'forgot-password': return 'Enviar Link';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full transform transition-all">
        {/* Header */}
        <div className="text-center p-8 pb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
              <Dumbbell size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {getTitle()}
          </h1>
          
          {mode === 'login' && (
            <p className="text-gray-600 dark:text-gray-400">
              Bem-vindo de volta! Entre para continuar seus treinos.
            </p>
          )}
          {mode === 'signup' && (
            <p className="text-gray-600 dark:text-gray-400">
              Preencha todos os campos para criar sua conta
            </p>
          )}
          {mode === 'forgot-password' && (
            <p className="text-gray-600 dark:text-gray-400">
              Digite seu email para receber o link de redefinição de senha.
            </p>
          )}
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start">
              <AlertCircle size={18} className="text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start">
              <CheckCircle size={18} className="text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-green-700 dark:text-green-300">{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'login' && (
              <div className="space-y-5">
                {/* Email */}
                <div>
                  <label htmlFor="loginEmail" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="loginEmail"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all placeholder-gray-400"
                      placeholder="seu@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="loginPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="loginPassword"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full pl-12 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all placeholder-gray-400"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-5 max-h-96 overflow-y-auto pr-2">
                {/* Seção 1: Dados Pessoais */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dados Pessoais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Nome Completo */}
                    <div className="md:col-span-2">
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nome Completo *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="fullName"
                          value={signUpData.fullName}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, fullName: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="Seu nome completo"
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="email"
                          value={signUpData.email}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, email: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="seu@email.com"
                          required
                        />
                      </div>
                    </div>

                    {/* Data de Nascimento */}
                    <div>
                      <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Data de Nascimento *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="birthDate"
                          value={signUpData.birthDate}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, birthDate: e.target.value }))}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          required
                          max={new Date(Date.now() - 13 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        />
                      </div>
                    </div>

                    {/* Sexo */}
                    <div>
                      <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Sexo *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Users size={16} className="text-gray-400" />
                        </div>
                        <select
                          id="gender"
                          value={signUpData.gender}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, gender: e.target.value as 'masculino' | 'feminino' | 'outro' }))}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white appearance-none"
                          required
                        >
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="outro">Outro</option>
                        </select>
                      </div>
                    </div>

                    {/* Senha */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Senha *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={16} className="text-gray-400" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          value={signUpData.password}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, password: e.target.value }))}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirmar Senha */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirmar Senha *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock size={16} className="text-gray-400" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          value={signUpData.confirmPassword}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="••••••••"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Seção 2: Dados Corporais */}
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dados Corporais</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Altura */}
                    <div>
                      <label htmlFor="height" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Altura (cm) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Ruler size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="height"
                          value={signUpData.height || ''}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="175"
                          min="100"
                          max="250"
                          required
                        />
                      </div>
                    </div>

                    {/* Peso */}
                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Peso (kg) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Scale size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="weight"
                          value={signUpData.weight || ''}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="70"
                          min="30"
                          max="300"
                          step="0.1"
                          required
                        />
                      </div>
                    </div>

                    {/* Pescoço */}
                    <div>
                      <label htmlFor="neckMeasurement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pescoço (cm) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Ruler size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="neckMeasurement"
                          value={signUpData.neckMeasurement || ''}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, neckMeasurement: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="35"
                          min="20"
                          max="60"
                          step="0.1"
                          required
                        />
                      </div>
                    </div>

                    {/* Cintura */}
                    <div>
                      <label htmlFor="waistMeasurement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cintura (cm) *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Ruler size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="waistMeasurement"
                          value={signUpData.waistMeasurement || ''}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, waistMeasurement: parseFloat(e.target.value) || 0 }))}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="80"
                          min="50"
                          max="200"
                          step="0.1"
                          required
                        />
                      </div>
                    </div>

                    {/* Quadril */}
                    <div>
                      <label htmlFor="hipMeasurement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Quadril (cm) {signUpData.gender === 'feminino' ? '*' : '(opcional)'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Ruler size={16} className="text-gray-400" />
                        </div>
                        <input
                          type="number"
                          id="hipMeasurement"
                          value={signUpData.hipMeasurement || ''}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, hipMeasurement: parseFloat(e.target.value) || undefined }))}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                          placeholder="95"
                          min="50"
                          max="200"
                          step="0.1"
                          required={signUpData.gender === 'feminino'}
                        />
                      </div>
                    </div>

                    {/* Objetivo */}
                    <div>
                      <label htmlFor="mainGoal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Objetivo Principal *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Target size={16} className="text-gray-400" />
                        </div>
                        <select
                          id="mainGoal"
                          value={signUpData.mainGoal}
                          onChange={(e) => setSignUpData(prev => ({ ...prev, mainGoal: e.target.value as any }))}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white appearance-none"
                          required
                        >
                          <option value="emagrecer">Emagrecer</option>
                          <option value="ganhar_massa">Ganhar Massa Muscular</option>
                          <option value="manter">Manter Peso</option>
                          <option value="definir">Definir/Tonificar</option>
                          <option value="resistencia">Melhorar Resistência</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mode === 'forgot-password' && (
              <div>
                <label htmlFor="forgotEmail" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="forgotEmail"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all placeholder-gray-400"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <User size={18} className="mr-2" />
                    {getButtonText()}
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 space-y-3">
            {mode === 'login' && (
              <>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => handleModeChange('forgot-password')}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium"
                  >
                    Esqueci minha senha
                  </button>
                </div>
                <div className="text-center border-t dark:border-gray-700 pt-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Não tem uma conta?{' '}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleModeChange('signup')}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-semibold"
                  >
                    Criar conta
                  </button>
                </div>
              </>
            )}

            {mode === 'signup' && (
              <div className="text-center border-t dark:border-gray-700 pt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Já tem uma conta?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-semibold"
                >
                  Entrar
                </button>
              </div>
            )}

            {mode === 'forgot-password' && (
              <div className="text-center border-t dark:border-gray-700 pt-4">
                <button
                  type="button"
                  onClick={() => handleModeChange('login')}
                  className="flex items-center justify-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors font-medium mx-auto"
                >
                  <ArrowLeft size={16} className="mr-1" />
                  Voltar ao login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;