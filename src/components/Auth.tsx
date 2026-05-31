import React, { useState, useEffect } from 'react';
import { 
  Lock, User, Mail, Phone, Calendar, MapPin, 
  Globe, Eye, EyeOff, Key, CheckCircle, AlertCircle, 
  Upload, Sparkles, LogIn, UserPlus, HelpCircle, ArrowRight
} from 'lucide-react';
import { UserProfile, UserSettings } from '../types';

// Built-in cool avatars with pleasant geometric/gradient icons
const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
];

interface AuthProps {
  onAuthSuccess: (profile: UserProfile, settings: UserSettings) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  // Mode: 'login' | 'register' | 'recovery'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery'>('login');
  
  // Registration States
  const [apelido, setApelido] = useState('');
  const [primeiroNome, setPrimeiroNome] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [nacionalidade, setNacionalidade] = useState('Moçambicana');
  const [cidade, setCidade] = useState('');
  const [telefone, setTelefone] = useState('');
  const [username, setUsername] = useState('');
  const [codigo, setCodigo] = useState('');
  const [confirmarCodigo, setConfirmarCodigo] = useState('');
  const [fotoUrl, setFotoUrl] = useState(PRESET_AVATARS[0]);
  
  // Login States
  const [loginUser, setLoginUser] = useState('');
  const [loginCode, setLoginCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Error / Success / Alert States
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Recovery States
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1); // 1: request, 2: input token, 3: change flow / view results
  const [recoveryTarget, setRecoveryTarget] = useState<'username' | 'password'>('password');
  const [recoveryContact, setRecoveryContact] = useState(''); // Email or Phone search
  const [generatedToken, setGeneratedToken] = useState('');
  const [inputToken, setInputToken] = useState('');
  const [matchedProfile, setMatchedProfile] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Load registered users from localStorage
  const getRegisteredAccounts = (): UserProfile[] => {
    try {
      const stored = localStorage.getItem('contabilidade_users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Clear messages inside views when shifting modes
  useEffect(() => {
    setErrorMessage('');
    setSuccessMessage('');
    // reset recovery
    setRecoveryStep(1);
    setRecoveryContact('');
    setGeneratedToken('');
    setInputToken('');
    setMatchedProfile(null);
  }, [authMode]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('A imagem de perfil deve ter menos de 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setFotoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validations
    if (!apelido || !primeiroNome || !dataNascimento || !email || !cidade || !telefone || !username || !codigo) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (codigo !== confirmarCodigo) {
      setErrorMessage('Os códigos de acesso não coincidem!');
      return;
    }

    if (codigo.length < 4) {
      setErrorMessage('O código de acesso deve ter pelo menos 4 dígitos/caracteres para sua segurança.');
      return;
    }

    const accounts = getRegisteredAccounts();
    
    // Check constraints
    if (accounts.some(acc => acc.username.toLowerCase() === username.toLowerCase())) {
      setErrorMessage('Este nome de usuário já está registado. Escolha outro.');
      return;
    }

    if (accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase())) {
      setErrorMessage('Este endereço de email já está registado no sistema.');
      return;
    }

    const newProfile: UserProfile = {
      apelido,
      primeiroNome,
      dataNascimento,
      email,
      nacionalidade,
      cidade,
      telefone,
      username,
      codigo,
      fotoUrl
    };

    const newSettings: UserSettings = {
      themeMode: 'dark',
      fontSize: 'medium',
      fontType: 'sans'
    };

    // Save
    accounts.push(newProfile);
    localStorage.setItem('contabilidade_users', JSON.stringify(accounts));

    // Also set default session for this user
    localStorage.setItem(`settings_${username}`, JSON.stringify(newSettings));

    setSuccessMessage('Conta criada com sucesso com segurança máxima! Faça o login.');
    setTimeout(() => {
      setAuthMode('login');
      setLoginUser(username);
    }, 1500);
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginUser || !loginCode) {
      setErrorMessage('Introduza o seu usuário e código de acesso.');
      return;
    }

    const accounts = getRegisteredAccounts();
    const user = accounts.find(
      acc => acc.username.toLowerCase() === loginUser.toLowerCase() && acc.codigo === loginCode
    );

    if (!user) {
      setErrorMessage('Usuário ou Código de acesso incorreto. Tente novamente ou recupere os dados.');
      return;
    }

    // Load custom settings if any exist
    let userSettings: UserSettings = {
      themeMode: 'dark',
      fontSize: 'medium',
      fontType: 'sans'
    };
    try {
      const storedSettings = localStorage.getItem(`settings_${user.username}`);
      if (storedSettings) {
        userSettings = JSON.parse(storedSettings);
      }
    } catch (err) {
      console.error(err);
    }

    onAuthSuccess(user, userSettings);
  };

  // Recover Account Stage 1: Send SMS/Email token
  const handleRequestRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (!recoveryContact) {
      setErrorMessage('Por favor, indique o email ou número de telefone da sua conta.');
      return;
    }

    const accounts = getRegisteredAccounts();
    const cleanSearch = recoveryContact.trim().toLowerCase();

    // Match by email or phone
    const user = accounts.find(
      acc => acc.email.toLowerCase() === cleanSearch || acc.telefone.replace(/\s+/g, '') === cleanSearch.replace(/\s+/g, '')
    );

    if (!user) {
      setErrorMessage('Não foi encontrada nenhuma conta com este contacto or email no sistema.');
      return;
    }

    // Generate random 6-digit confirmation token
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedToken(token);
    setMatchedProfile(user);
    setRecoveryStep(2);
  };

  // Recover Account Stage 2: Verify Token
  const handleVerifyToken = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (inputToken !== generatedToken) {
      setErrorMessage('O código de verificação introduzido está errado. Verifique o código exibido no banner de simulação.');
      return;
    }

    setRecoveryStep(3);
  };

  // Recover Account Stage 3: Complete / Change Password
  const handleCompletePasswordReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword.length < 4) {
      setErrorMessage('O código de acesso deve ter pelo menos 4 dígitos/caracteres para sua segurança.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('As passwords não coincidem!');
      return;
    }

    if (!matchedProfile) return;

    const accounts = getRegisteredAccounts();
    const updatedAccounts = accounts.map(acc => {
      if (acc.username.toLowerCase() === matchedProfile.username.toLowerCase()) {
        return { ...acc, codigo: newPassword };
      }
      return acc;
    });

    localStorage.setItem('contabilidade_users', JSON.stringify(updatedAccounts));
    setSuccessMessage('A sua password foi redefinida com segurança! Por favor, faça login com a nova password.');
    
    setTimeout(() => {
      setAuthMode('login');
      setLoginUser(matchedProfile.username);
    }, 2000);
  };

  return (
    <div id="auth_view" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-black">
      
      {/* Simulation Banner for email/phone verification notification codes */}
      {generatedToken && recoveryStep === 2 && (
        <div id="token-banner" className="w-full max-w-md bg-emerald-950/95 border border-emerald-500/30 text-emerald-300 p-4 rounded-xl mb-4 text-center shadow-lg animate-bounce duration-1000">
          <div className="flex items-center justify-center gap-2 font-semibold">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>[Simulação de Notificação Segura]</span>
          </div>
          <p className="mt-1 text-sm text-slate-300">
            Enviámos um SMS/Email para <strong className="text-emerald-400 font-mono">{recoveryContact}</strong> contendo o seguinte código de segurança:
          </p>
          <div className="mt-2 text-2xl font-mono tracking-widest text-emerald-200 font-black bg-slate-900 border border-emerald-500/20 py-1.5 px-4 rounded-lg inline-block shadow-inner">
            {generatedToken}
          </div>
        </div>
      )}

      <div id="auth-card" className="w-full max-w-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="inline-flex items-center justify-center p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/60 mb-4 shadow-inner">
            <Lock className="w-8 h-8 text-emerald-500 animate-pulse" />
          </div>
          <h1 className="text-2xl sm:text-3.5xl font-black text-white tracking-tight">
            CONTABILIDADE REAL-TIME
          </h1>
          <p className="text-slate-400 text-sm mt-1 mx-auto max-w-md">
            Módulo de Segurança e Auditoria de Contas Integrada de Moçambique
          </p>
        </div>

        {/* Global errors and success alerts */}
        {errorMessage && (
          <div id="error-alert" className="mb-6 p-4 bg-rose-950/50 border border-rose-500/30 text-rose-300 rounded-2xl text-sm flex items-start gap-3 shadow-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div id="success-alert" className="mb-6 p-4 bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 rounded-2xl text-sm flex items-start gap-3 shadow-md">
            <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* ----------------- LOGIN MODE ----------------- */}
        {authMode === 'login' && (
          <form id="form-login" onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-2">
                Nome de Usuário
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <User className="w-5 h-5" />
                </span>
                <input
                  id="login-username"
                  type="text"
                  required
                  placeholder="Ex: joao_mze"
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium text-sm shadow-inner"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase">
                  Código de Acesso (Senha)
                </label>
                <button
                  type="button"
                  id="btn-toggle-pass"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-slate-500 hover:text-emerald-400 transition-colors flex items-center gap-1 font-semibold"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPassword ? 'Ocular' : 'Mostrar'}
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                  <Key className="w-5 h-5" />
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono text-sm tracking-widest shadow-inner"
                />
              </div>
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black py-4 px-6 rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-emerald-500/20 shadow-emerald-950 hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <LogIn className="w-5 h-5 shrink-0" />
              Entrar no Sistema
            </button>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800/60 gap-3 text-sm text-slate-400">
              <button
                id="link-register"
                type="button"
                onClick={() => setAuthMode('register')}
                className="hover:text-emerald-400 font-semibold flex items-center gap-1.5 group transition-colors"
              >
                <UserPlus className="w-4 h-4 text-emerald-500 group-hover:-translate-x-0.5 transition-transform" />
                Não tem conta? Registar-se
              </button>
              <button
                id="link-recovery"
                type="button"
                onClick={() => setAuthMode('recovery')}
                className="hover:text-amber-400 font-semibold flex items-center gap-1.5 group transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-amber-500" />
                Esqueceu as credenciais?
              </button>
            </div>
          </form>
        )}

        {/* ----------------- REGISTER MODE ----------------- */}
        {authMode === 'register' && (
          <form id="form-register" onSubmit={handleRegister} className="space-y-6 relative z-10">
            <p className="text-slate-400 text-sm border-b border-slate-800/80 pb-3 font-semibold">
              Preencha conscientemente todos os seus dados auditados de faturamento pessoal:
            </p>

            {/* Profile Picture Selection */}
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-850">
              <span className="block text-xs font-bold text-slate-300 tracking-wider uppercase">
                Foto de Perfil do Utilizador
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-900 flex items-center justify-center">
                  <img src={fotoUrl} alt="Avatar" className="w-full h-full object-cover" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFotoUrl(avatar)}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                          fotoUrl === avatar ? 'border-emerald-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={avatar} alt="Preset Av" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold py-2 px-3 rounded-lg border border-slate-700 cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5 text-slate-450" />
                      Carregar Foto Própria
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                  Primeiro Nome *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-primeironome"
                    type="text"
                    required
                    placeholder="Ex: Francisco"
                    value={primeiroNome}
                    onChange={(e) => setPrimeiroNome(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                  Apelido (Último Nome) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-apelido"
                    type="text"
                    required
                    placeholder="Ex: Cássimo"
                    value={apelido}
                    onChange={(e) => setApelido(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                  Data de Nascimento *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-datanascimento"
                    type="date"
                    required
                    value={dataNascimento}
                    onChange={(e) => setDataNascimento(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                  Nacionalidade *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Globe className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-nacionalidade"
                    type="text"
                    required
                    placeholder="Ex: Moçambicana"
                    value={nacionalidade}
                    onChange={(e) => setNacionalidade(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                  Cidade de Residência *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-cidade"
                    type="text"
                    required
                    placeholder="Ex: Maputo, Beira"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                  Número de Telefone *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-telefone"
                    type="tel"
                    required
                    placeholder="Ex: +258 84 123 4567"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                  Endereço de Email *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    placeholder="franciscassimo@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                  Nome de Usuário (Username) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-username"
                    type="text"
                    required
                    placeholder="Ex: Francisco99"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                  Código de Acesso (Senha) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-senha"
                    type="password"
                    required
                    minLength={4}
                    placeholder="Mínimo 4 caracteres"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all text-sm font-mono tracking-widest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1.5">
                  Confirmar Código de Acesso *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-confirmarsenha"
                    type="password"
                    required
                    value={confirmarCodigo}
                    onChange={(e) => setConfirmarCodigo(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all text-sm font-mono tracking-widest"
                  />
                </div>
              </div>
            </div>

            <button
              id="btn-submit-register"
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-black py-3.5 px-6 rounded-2xl font-black text-sm tracking-wider uppercase transition-all shadow-lg hover:shadow-emerald-500/20 shadow-emerald-950 cursor-pointer mt-2"
            >
              Concluir Registo Seguro
            </button>

            <div className="text-center pt-2">
              <button
                id="link-back-login"
                type="button"
                onClick={() => setAuthMode('login')}
                className="text-sm text-slate-400 hover:text-white font-semibold transition-colors"
              >
                Já tem uma conta no sistema? Faça o login agora
              </button>
            </div>
          </form>
        )}

        {/* ----------------- RECOVERY MODE ----------------- */}
        {authMode === 'recovery' && (
          <div className="space-y-6 relative z-10">
            <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <span>Recuperação de Credenciais</span>
            </h2>

            {/* Step 1: Input Contact */}
            {recoveryStep === 1 && (
              <form id="form-recovery-step1" onSubmit={handleRequestRecovery} className="space-y-4">
                <p className="text-slate-400 text-sm">
                  Escolha o que pretende recuperar e insira o seu contacto de telemóvel registado (com indicativo) ou email. O sistema enviará um código de segurança em tempo real para Auditoria.
                </p>

                <div className="grid grid-cols-2 gap-3 bg-slate-950/30 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRecoveryTarget('password')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      recoveryTarget === 'password' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Recuperar Código (Senha)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecoveryTarget('username')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                      recoveryTarget === 'username' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Recuperar Usuário
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-2">
                    Contacto de Email ou Telemóvel Registado
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                      <Mail className="w-5 h-5" />
                    </span>
                    <input
                      id="rec-contact"
                      type="text"
                      required
                      placeholder="Ex: joao@email.com ou +258 84 123 4567"
                      value={recoveryContact}
                      onChange={(e) => setRecoveryContact(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-medium text-sm shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 py-3 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Voltar ao Login
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-indigo-500 hover:bg-indigo-400 text-white py-3 px-4 rounded-xl text-xs font-black uppercase transition-all tracking-wider shadow-lg shadow-indigo-950 cursor-pointer"
                  >
                    Enviar Código
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Input OTP Verification Code */}
            {recoveryStep === 2 && (
              <form id="form-recovery-step2" onSubmit={handleVerifyToken} className="space-y-4">
                <p className="text-slate-400 text-sm">
                  Foi enviado um código de 6 dígitos para o contacto <span className="text-white font-semibold font-mono">{recoveryContact}</span>. Introduza-o abaixo para prosseguir:
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-2">
                    Código de Segurança de 6 dígitos
                  </label>
                  <input
                    id="rec-token"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="Introduza os 6 dígitos"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl py-3 px-4 text-center text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-all font-mono text-xl tracking-widest shadow-inner font-black"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setRecoveryStep(1)}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 py-3 px-4 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Configurar Contacto
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg cursor-pointer animate-pulse"
                  >
                    Confirmar Código
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Action completed display */}
            {recoveryStep === 3 && matchedProfile && (
              <div className="space-y-5">
                {recoveryTarget === 'username' ? (
                  <div className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl text-center space-y-3">
                    <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                    <p className="text-slate-400 text-sm">Validado com sucesso! O seu Nome de Usuário de login é:</p>
                    <div className="text-2xl font-mono text-emerald-300 bg-slate-900 border border-slate-850 py-3 px-6 rounded-xl inline-block font-black">
                      {matchedProfile.username}
                    </div>
                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          setLoginUser(matchedProfile.username);
                        }}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black shadow-lg py-2.5 px-5 rounded-lg uppercase tracking-wider cursor-pointer"
                      >
                        Copiar e ir para o Login
                      </button>
                    </div>
                  </div>
                ) : (
                  <form id="form-reset-password" onSubmit={handleCompletePasswordReset} className="space-y-4">
                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                      <p className="text-xs text-emerald-400 font-semibold mb-1">Conta verificada com segurança:</p>
                      <p className="text-sm font-semibold text-white">
                        {matchedProfile.primeiroNome} {matchedProfile.apelido} ({matchedProfile.username})
                      </p>
                    </div>

                    <p className="text-slate-450 text-xs">
                      Crie um novo código de acesso totalmente seguro para restabelecer o seu registo de caixa:
                    </p>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1">
                          Novo Código de Acesso *
                        </label>
                        <input
                          id="rec-newpassword"
                          type="password"
                          required
                          minLength={4}
                          placeholder="Mínimo 4 caracteres"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-605 focus:outline-none focus:border-indigo-500 transition-all text-sm font-mono tracking-widest"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 tracking-wider uppercase mb-1">
                          Confirmar Código *
                        </label>
                        <input
                          id="rec-confirmnewpassword"
                          type="password"
                          required
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3 text-white placeholder-slate-605 focus:outline-none focus:border-indigo-500 transition-all text-sm font-mono tracking-widest"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg cursor-pointer"
                    >
                      Redefinir e Entrar no Sistema
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

      </div>
      
      <div className="mt-8 text-center text-slate-600 text-xs tracking-wide">
        &copy; 2026 Contabilidade em Tempo Real &bull; Todos os direitos reservados.
      </div>
    </div>
  );
}
