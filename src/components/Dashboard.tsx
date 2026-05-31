import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Calendar, TrendingDown, BookOpen, Clock, 
  Trash2, CheckSquare, Settings, User, LogOut, Phone, 
  MapPin, ShieldCheck, Mail, CalendarDays, PlusCircle, AlertTriangle, 
  Search, Filter, ChevronDown, Check, Palette, Type, HelpCircle, ArrowUpRight,
  Upload
} from 'lucide-react';
import { UserProfile, UserSettings, Expense, Debt } from '../types';

interface DashboardProps {
  user: UserProfile;
  settings: UserSettings;
  onLogout: () => void;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onUpdateProfile: (newProfile: UserProfile) => void;
}

export default function Dashboard({ 
  user, 
  settings, 
  onLogout, 
  onUpdateSettings,
  onUpdateProfile
}: DashboardProps) {
  // Database mock system dates/clock
  const CURRENT_DATE_STRING = "2026-05-31"; // Strict local audit date given by meta

  // Load user data from localStorage or create defaults
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  // Search, filter, and page tabs
  const [currentTab, setCurrentTab] = useState<'despesas' | 'dividas' | 'calculos' | 'definicoes' | 'historicos'>('despesas');
  
  // New Expense form states
  const [expValor, setExpValor] = useState('');
  const [expDescricao, setExpDescricao] = useState('');
  const [expData, setExpData] = useState(CURRENT_DATE_STRING);

  // New Debt form states
  const [debtDevedor, setDebtDevedor] = useState('');
  const [debtDescr, setDebtDescr] = useState('');
  const [debtValor, setDebtValor] = useState('');
  const [debtPrazo, setDebtPrazo] = useState('');

  // Filtering states
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all'); // 'all' or '01' to '12'
  const [expenseSearch, setExpenseSearch] = useState('');
  const [debtSearch, setDebtSearch] = useState('');

  // Settings pane states
  const [editTelefone, setEditTelefone] = useState(user.telefone);
  const [editCidade, setEditCidade] = useState(user.cidade);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPrimeiroNome, setEditPrimeiroNome] = useState(user.primeiroNome);
  const [editApelido, setEditApelido] = useState(user.apelido);
  const [editFotoUrl, setEditFotoUrl] = useState(user.fotoUrl);

  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Load account data on render or user swap
  useEffect(() => {
    try {
      const storedExpStream = localStorage.getItem(`expenses_${user.username}`);
      const storedDebtStream = localStorage.getItem(`debts_${user.username}`);
      
      if (storedExpStream) {
        setExpenses(JSON.parse(storedExpStream));
      } else {
        // Hydrate demo expenses so first-time user has dynamic data to analyze
        const demoExpenses: Expense[] = [
          { id: 'exp-demo-1', valor: 3500, descricao: 'Compra de papel sulfite e material de escritório', data: '2026-05-28', registradoEm: new Date().toISOString() },
          { id: 'exp-demo-2', valor: 14200, descricao: 'Internet Fibra Óptica e Telefonia - Mensal', data: '2026-05-30', registradoEm: new Date().toISOString() },
          { id: 'exp-demo-3', valor: 25000, descricao: 'Manutenção de Computador do Caixa', data: '2026-05-31', registradoEm: new Date().toISOString() },
          { id: 'exp-demo-4', valor: 8900, descricao: 'Almoço com Fornecedores de Maputo', data: '2026-05-31', registradoEm: new Date().toISOString() }
        ];
        setExpenses(demoExpenses);
        localStorage.setItem(`expenses_${user.username}`, JSON.stringify(demoExpenses));
      }

      if (storedDebtStream) {
        setDebts(JSON.parse(storedDebtStream));
      } else {
        // Hydrate demo debts so first-time user has data
        const demoDebts: Debt[] = [
          { id: 'debt-demo-1', devedor: 'Amélia Nhaca', descr: 'Empréstimo para insumos agrícolas de caixa', valorTotal: 45000, prazo: '2026-05-25', fechado: false, registradoEm: new Date().toISOString() },
          { id: 'debt-demo-2', devedor: 'Delfim Loureiro', descr: 'Venda de mercadoria a prazo no atacado', valorTotal: 12500, prazo: '2026-06-03', fechado: false, registradoEm: new Date().toISOString() },
          { id: 'debt-demo-3', devedor: 'Celso Chitará', descr: 'Prestação de consultoria contábil devida', valorTotal: 30000, prazo: '2026-06-15', fechado: false, registradoEm: new Date().toISOString() }
        ];
        setDebts(demoDebts);
        localStorage.setItem(`debts_${user.username}`, JSON.stringify(demoDebts));
      }
    } catch (err) {
      console.error("Erro no carregamento de dados locais: ", err);
    }
  }, [user.username]);

  // Sync expenses and debts back to localStorage
  const saveExpensesLocally = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    localStorage.setItem(`expenses_${user.username}`, JSON.stringify(newExpenses));
  };

  const saveDebtsLocally = (newDebts: Debt[]) => {
    setDebts(newDebts);
    localStorage.setItem(`debts_${user.username}`, JSON.stringify(newDebts));
  };

  // Modern currency formatter
  const formatMZ = (valor: number): string => {
    return new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(valor) + " MT";
  };

  // Formatting auxiliary dates
  const formatarDataPortugues = (dataString: string): string => {
    if (!dataString) return '-';
    const partes = dataString.split('-');
    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
  };

  // Helper date math functions comparing against CURRENT_DATE_STRING ("2026-05-31")
  const parseDate = (dStr: string) => {
    const parts = dStr.split('-');
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  };

  const isToday = (dStr: string) => dStr === CURRENT_DATE_STRING;

  const isThisWeek = (dStr: string) => {
    const checkDate = parseDate(dStr);
    const auditDate = parseDate(CURRENT_DATE_STRING);
    const diffTime = auditDate.getTime() - checkDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    // dentro de 7 dias retroativos e não futuros
    return diffDays >= 0 && diffDays <= 7;
  };

  const isThisMonth = (dStr: string) => {
    const checkParts = dStr.split('-');
    const auditParts = CURRENT_DATE_STRING.split('-');
    return checkParts[0] === auditParts[0] && checkParts[1] === auditParts[1];
  };

  const isThisYear = (dStr: string) => {
    const checkParts = dStr.split('-');
    const auditParts = CURRENT_DATE_STRING.split('-');
    return checkParts[0] === auditParts[0];
  };

  // Totalized Real-Time Spending Computations
  const totalGastoHoje = expenses.filter(e => isToday(e.data)).reduce((acc, curr) => acc + curr.valor, 0);
  const totalGastoSemana = expenses.filter(e => isThisWeek(e.data)).reduce((acc, curr) => acc + curr.valor, 0);
  const totalGastoMes = expenses.filter(e => isThisMonth(e.data)).reduce((acc, curr) => acc + curr.valor, 0);
  const totalGastoAno = expenses.filter(e => isThisYear(e.data)).reduce((acc, curr) => acc + curr.valor, 0);

  // Totalized Real-time Debt Computations (Only active/unpaid debts calculated towards financial claims)
  // Or we can display active debts vs total debts. Let's calculate active (open) debts
  const totalDividaHoje = debts.filter(d => !d.fechado && isToday(d.prazo)).reduce((acc, curr) => acc + curr.valorTotal, 0);
  const totalDividaSemana = debts.filter(d => !d.fechado && isThisWeek(d.prazo)).reduce((acc, curr) => acc + curr.valorTotal, 0);
  const totalDividaMes = debts.filter(d => !d.fechado && isThisMonth(d.prazo)).reduce((acc, curr) => acc + curr.valorTotal, 0);
  const totalDividaAno = debts.filter(d => !d.fechado && isThisYear(d.prazo)).reduce((acc, curr) => acc + curr.valorTotal, 0);

  // Computed absolute aggregate values
  const totalAbsolutoGasto = expenses.reduce((acc, curr) => acc + curr.valor, 0);
  const totalAbsolutoAbertoDivida = debts.filter(d => !d.fechado).reduce((acc, d) => acc + d.valorTotal, 0);
  const totalAbsolutoDividasGeral = debts.reduce((acc, d) => acc + d.valorTotal, 0);

  // Add Expense Controller
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const valParsed = parseFloat(expValor);
    if (isNaN(valParsed) || valParsed <= 0) {
      alert("Por favor, introduza um valor de dinheiro gasto válido.");
      return;
    }
    if (!expDescricao.trim()) {
      alert("Por favor, forneça uma descrição concisa do gasto.");
      return;
    }

    const newExp: Expense = {
      id: 'exp-' + Date.now().toString(),
      valor: valParsed,
      descricao: expDescricao.trim(),
      data: expData,
      registradoEm: new Date().toISOString()
    };

    saveExpensesLocally([newExp, ...expenses]);
    setExpValor('');
    setExpDescricao('');
    setExpData(CURRENT_DATE_STRING);
  };

  // Add Debt Controller
  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const valParsed = parseFloat(debtValor);
    if (isNaN(valParsed) || valParsed <= 0) {
      alert("Por favor, introduza um valor financeiro total de dívida válido.");
      return;
    }
    if (!debtDevedor.trim()) {
      alert("Por favor, indique quem é o devedor/beneficiário.");
      return;
    }
    if (!debtDescr.trim()) {
      alert("Por favor, indique o motivo/descrição da dívida.");
      return;
    }
    if (!debtPrazo) {
      alert("Por favor, especifique o prazo final de pagamento.");
      return;
    }

    const newDebt: Debt = {
      id: 'debt-' + Date.now().toString(),
      devedor: debtDevedor.trim(),
      descr: debtDescr.trim(),
      valorTotal: valParsed,
      prazo: debtPrazo,
      fechado: false,
      registradoEm: new Date().toISOString()
    };

    saveDebtsLocally([newDebt, ...debts]);
    setDebtDevedor('');
    setDebtDescr('');
    setDebtValor('');
    setDebtPrazo('');
  };

  // Delete Expense Entry (Allowed as requested)
  const handleDeleteExpense = (id: string) => {
    const filtered = expenses.filter(e => e.id !== id);
    saveExpensesLocally(filtered);
  };

  // Close Register / Confirm Receipt immediately (closes instantly as requested)
  const handleCloseDebt = (id: string) => {
    const updated = debts.map(d => {
      if (d.id === id) {
        return { ...d, fechado: true, pagoEm: CURRENT_DATE_STRING };
      }
      return d;
    });
    saveDebtsLocally(updated);
  };

  // Delete any debt entry (either active or closed) as requested
  const handleDeleteDebt = (id: string) => {
    const filtered = debts.filter(d => d.id !== id);
    saveDebtsLocally(filtered);
  };

  // Filter lists based on selectedMonthFilter and Search Input
  const monthsList = [
    { value: 'all', label: 'Todos os Meses' },
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  // Filtering expenses
  const filteredExpenses = expenses.filter(e => {
    // Month filter check
    if (selectedMonthFilter !== 'all') {
      const expMonth = e.data.split('-')[1];
      if (expMonth !== selectedMonthFilter) return false;
    }
    // Search keyword check
    if (expenseSearch.trim() !== '') {
      const cleanKeyword = expenseSearch.toLowerCase();
      const matchDesc = e.descricao.toLowerCase().includes(cleanKeyword);
      const matchVal = e.valor.toString().includes(cleanKeyword);
      const matchDat = e.data.includes(cleanKeyword);
      return matchDesc || matchVal || matchDat;
    }
    return true;
  });

  // Filtering debts
  const filteredDebts = debts.filter(d => {
    if (selectedMonthFilter !== 'all') {
      const debtMonth = d.prazo.split('-')[1];
      if (debtMonth !== selectedMonthFilter) return false;
    }
    if (debtSearch.trim() !== '') {
      const cleanKeyword = debtSearch.toLowerCase();
      const matchDevedor = d.devedor.toLowerCase().includes(cleanKeyword);
      const matchDescr = d.descr.toLowerCase().includes(cleanKeyword);
      const matchVal = d.valorTotal.toString().includes(cleanKeyword);
      return matchDevedor || matchDescr || matchVal;
    }
    return true;
  });

  // Due Date alert logic for upcoming or expired debts
  const getDebtAlertState = (prazo: string, isClosed: boolean) => {
    if (isClosed) return { alert: false, text: "Liquidado", color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" };
    
    const deadline = parseDate(prazo);
    const current = parseDate(CURRENT_DATE_STRING);
    const diffTime = deadline.getTime() - current.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { 
        alert: true, 
        text: `VENCIDO há ${Math.abs(diffDays)} dia(s)!`, 
        color: "text-rose-500 bg-rose-500/15 border-rose-500/20 shadow-rose-950 animate-pulse font-bold" 
      };
    } else if (diffDays === 0) {
      return { 
        alert: true, 
        text: "PAGA HOJE! Prazo Limite!", 
        color: "text-red-500 bg-red-500/15 border-red-500/20 font-black animate-bounce" 
      };
    } else if (diffDays <= 3) {
      return { 
        alert: true, 
        text: `Prazo esgota em ${diffDays} dia(s)! Alerta!`, 
        color: "text-amber-500 bg-amber-500/15 border-amber-500/20 font-bold" 
      };
    }
    return { alert: false, text: `Restam ${diffDays} dias de prazo`, color: "text-slate-400 bg-slate-800/40" };
  };

  // Profile preferences form update handler
  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess('');

    if (!editPrimeiroNome || !editApelido || !editEmail) {
      alert("Os campos Primeiro Nome, Apelido e Email são obrigatórios.");
      return;
    }

    const updatedProfile: UserProfile = {
      ...user,
      primeiroNome: editPrimeiroNome,
      apelido: editApelido,
      email: editEmail,
      telefone: editTelefone,
      cidade: editCidade,
      fotoUrl: editFotoUrl
    };

    // Update in parent state and update local accounts list
    onUpdateProfile(updatedProfile);

    // Sync other accounts list in localStorage
    try {
      const currentListStr = localStorage.getItem('contabilidade_users');
      if (currentListStr) {
        const arr: UserProfile[] = JSON.parse(currentListStr);
        const nextList = arr.map(acc => {
          if (acc.username.toLowerCase() === user.username.toLowerCase()) {
            return updatedProfile;
          }
          return acc;
        });
        localStorage.setItem('contabilidade_users', JSON.stringify(nextList));
      }
    } catch (e) {
      console.error(e);
    }

    setSettingsSuccess("Informações de perfil actualizadas com sucesso!");
    setTimeout(() => setSettingsSuccess(''), 3000);
  };

  // Upload Photo inside Settings
  const handleSettingsPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('A foto deve ser menor do que 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setEditFotoUrl(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Render correct content panel
  return (
    <div id="dashboard_view" className={`min-h-screen theme-${settings.themeMode} font-${settings.fontType === 'sans' ? 'sans-inter' : settings.fontType === 'display' ? 'display-space' : settings.fontType === 'mono' ? 'font-mono-jb' : 'font-serif-playfair'} size-${settings.fontSize} bg-[var(--bg-primary)] text-[var(--text-main)] transition-all duration-300`}>
      
      {/* Dynamic Header */}
      <header id="dash-header" className="border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/90 backdrop-blur-md sticky top-0 z-40 transition-colors shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-500 shadow-inner">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-[var(--text-main)] flex items-center gap-2">
                CONTABILIDADE MZ
                <span className="text-xs bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/10">
                  REAL-TIME
                </span>
              </h1>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Auditoria de Livro e Caixa Activa &bull; {CURRENT_DATE_STRING} (Maputo)
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-x-4">
            {/* Logged user summary card */}
            <div id="user-header-card" className="flex items-center gap-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-1 px-3 shadow-inner">
              <div className="w-9 h-9 rounded-lg overflow-hidden border border-[var(--border-color)] bg-slate-850 shrink-0">
                <img src={user.fotoUrl} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-black leading-tight text-[var(--text-main)]">
                  {user.primeiroNome} {user.apelido}
                </p>
                <p className="text-[10px] font-mono text-[var(--text-muted)] font-semibold leading-tight">
                  @{user.username}
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              id="btn-logout"
              onClick={onLogout}
              className="bg-rose-500 hover:bg-rose-400 active:bg-rose-600 text-white rounded-xl p-2.5 transition-all text-xs font-bold outline-none flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-rose-950/10"
              title="Encerrar Sessão Segura"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Real-time summaries section (Spent vs Debt side by side for Day, Week, Month, Year) */}
        <section id="panel-metrics" className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl relative overflow-hidden transition-colors">
          
          <div className="absolute top-0 right-0 w-80 h-40 bg-[var(--color-accent)]/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b border-[var(--border-color)]/60 gap-4">
            <div>
              <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-widest font-mono">
                BALANCETE EM MOÇAMBIQUE METICAL
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] tracking-tight">
                Consolidação Financeira em Tempo Real
              </h2>
            </div>
            
            {/* Quick stats totals indicators */}
            <div className="flex gap-3">
              <div className="text-right">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Gastos Totais</span>
                <span className="font-mono text-base font-black text-[var(--text-main)]">{formatMZ(totalAbsolutoGasto)}</span>
              </div>
              <div className="w-px h-8 bg-[var(--border-color)]"></div>
              <div className="text-right">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Dívidas Activas</span>
                <span className="font-mono text-base font-black text-rose-400 text-rose-500">{formatMZ(totalAbsolutoAbertoDivida)}</span>
              </div>
            </div>
          </div>

          {/* Timeframe comparison bento columns (Total spent vs Debt side-by-side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* TODAY STAT CARDS */}
            <div id="stat-card-today" className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/40 pb-2">
                <span className="text-xs font-black text-[var(--text-main)] flex items-center gap-1.5 uppercase tracking-wide">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  Hoje
                  <span className="text-[9px] bg-slate-500/10 text-[var(--text-muted)] px-1.5 rounded-md font-mono">Diário</span>
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Gastos Realizados</span>
                  <p className="font-mono text-lg font-black text-[var(--text-main)]">{formatMZ(totalGastoHoje)}</p>
                </div>
                <div className="border-t border-[var(--border-color)]/20 pt-1.5">
                  <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Dívidas Limite Hoje</span>
                  <p className="font-mono text-lg font-black text-rose-400">{formatMZ(totalDividaHoje)}</p>
                </div>
              </div>
            </div>

            {/* WEEKLY STAT CARDS */}
            <div id="stat-card-week" className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/40 pb-2">
                <span className="text-xs font-black text-[var(--text-main)] flex items-center gap-1.5 uppercase tracking-wide">
                  <Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  Esta Semana
                  <span className="text-[9px] bg-slate-500/10 text-[var(--text-muted)] px-1.5 rounded-md font-mono">Últimos 7d</span>
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Gastos Realizados</span>
                  <p className="font-mono text-lg font-black text-[var(--text-main)]">{formatMZ(totalGastoSemana)}</p>
                </div>
                <div className="border-t border-[var(--border-color)]/20 pt-1.5">
                  <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Dívidas Limite Semana</span>
                  <p className="font-mono text-lg font-black text-rose-400">{formatMZ(totalDividaSemana)}</p>
                </div>
              </div>
            </div>

            {/* MONTHLY STAT CARDS */}
            <div id="stat-card-month" className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/40 pb-2">
                <span className="text-xs font-black text-[var(--text-main)] flex items-center gap-1.5 uppercase tracking-wide">
                  <CalendarDays className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  Este Mês
                  <span className="text-[9px] bg-slate-500/10 text-[var(--text-muted)] px-1.5 rounded-md font-mono">Mensal</span>
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Gastos Realizados</span>
                  <p className="font-mono text-lg font-black text-[var(--text-main)]">{formatMZ(totalGastoMes)}</p>
                </div>
                <div className="border-t border-[var(--border-color)]/20 pt-1.5">
                  <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Dívidas Limite Mês</span>
                  <p className="font-mono text-lg font-black text-rose-400">{formatMZ(totalDividaMes)}</p>
                </div>
              </div>
            </div>

            {/* ANNUAL STAT CARDS */}
            <div id="stat-card-year" className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl p-4 shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border-color)]/40 pb-2">
                <span className="text-xs font-black text-[var(--text-main)] flex items-center gap-1.5 uppercase tracking-wide">
                  <TrendingDown className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                  Este Ano
                  <span className="text-[9px] bg-slate-500/10 text-[var(--text-muted)] px-1.5 rounded-md font-mono">Anual</span>
                </span>
              </div>
              <div className="space-y-2">
                <div>
                  <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Gastos Realizados</span>
                  <p className="font-mono text-lg font-black text-[var(--text-main)]">{formatMZ(totalGastoAno)}</p>
                </div>
                <div className="border-t border-[var(--border-color)]/20 pt-1.5">
                  <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Dívidas Limite Ano</span>
                  <p className="font-mono text-lg font-black text-rose-400">{formatMZ(totalDividaAno)}</p>
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* Workspace core navigation buttons for active workspace block */}
        <div id="subbar-nav" className="flex flex-wrap gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-1.5 rounded-2xl shadow-md transition-colors w-full">
          <button
            id="tab-btn-despesas"
            type="button"
            onClick={() => setCurrentTab('despesas')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              currentTab === 'despesas' ? 'bg-[var(--color-accent)] text-black shadow-md font-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]/55'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Registo de Despesas
          </button>

          <button
            id="tab-btn-dividas"
            type="button"
            onClick={() => setCurrentTab('dividas')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              currentTab === 'dividas' ? 'bg-[var(--color-accent)] text-black shadow-md font-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]/55'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Registo de Dívidas
            <span className="text-[9px] bg-amber-550/20 border border-amber-500/30 text-amber-300 font-bold px-1.5 py-0.5 rounded-full font-mono">
              {debts.filter(d => !d.fechado).length}
            </span>
          </button>

          <button
            id="tab-btn-calculos"
            type="button"
            onClick={() => setCurrentTab('calculos')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              currentTab === 'calculos' ? 'bg-[var(--color-accent)] text-black shadow-md font-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]/55'
            }`}
          >
            <TrendingDown className="w-4 h-4" />
            Cálculos Totais
          </button>

          <button
            id="tab-btn-historicos"
            type="button"
            onClick={() => setCurrentTab('historicos')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
              currentTab === 'historicos' ? 'bg-[var(--color-accent)] text-black shadow-md font-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]/55'
            }`}
          >
            <Clock className="w-4 h-4" />
            Históricos de Registos
          </button>

          <button
            id="tab-btn-definicoes"
            type="button"
            onClick={() => setCurrentTab('definicoes')}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all md:ml-auto ${
              currentTab === 'definicoes' ? 'bg-[var(--color-accent)] text-black shadow-md font-black' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]/55'
            }`}
          >
            <Settings className="w-4 h-4" />
            Definição
          </button>
        </div>

        {/* ----------------- TAB: REGISTO DE DESPESAS ----------------- */}
        {currentTab === 'despesas' && (
          <div id="panel-despesas" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Expense form left column */}
            <div className="lg:col-span-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
              <div>
                <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-widest font-mono">Entrada de Caixa</span>
                <h3 className="text-lg font-black text-[var(--text-main)] flex items-center gap-2 border-b border-[var(--border-color)]/60 pb-2">
                  <PlusCircle className="w-5 h-5 text-[var(--color-accent)]" />
                  Registar Nova Despesa (Saída)
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Insira os dados do fluxo de caixa gasto para fins de auditoria.</p>
              </div>

              <form id="form-add-expense" onSubmit={handleAddExpense} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                    Valor Gasto (MT) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold font-mono">
                      MT
                    </span>
                    <input
                      id="input-exp-valor"
                      type="number"
                      step="any"
                      required
                      placeholder="0,00"
                      value={expValor}
                      onChange={(e) => setExpValor(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-3 pl-12 pr-4 text-[var(--text-main)] placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent)] font-mono text-sm shadow-inner transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                    Utilidade ou Descrição do Gasto *
                  </label>
                  <textarea
                    id="input-exp-descricao"
                    rows={3}
                    required
                    placeholder="Ex: Pagamento de energia ou aquisição de material para escritório..."
                    value={expDescricao}
                    onChange={(e) => setExpDescricao(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-[var(--text-main)] placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent)] text-sm shadow-inner transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                    Data do Gasto *
                  </label>
                  <input
                    id="input-exp-data"
                    type="date"
                    required
                    value={expData}
                    onChange={(e) => setExpData(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-3 px-4 text-[var(--text-main)] focus:outline-none focus:border-[var(--color-accent)] text-sm font-mono transition-all"
                  />
                  <span className="text-[10px] text-[var(--text-muted)] mt-1.5 block">
                    Data de auditoria ativa corrente baseada no sistema ({CURRENT_DATE_STRING}).
                  </span>
                </div>

                <button
                  id="btn-submit-expense"
                  type="submit"
                  className="w-full bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4.5 h-4.5 shrink-0" />
                  Salvar Despesa
                </button>
              </form>
            </div>

            {/* Quick list right column */}
            <div className="lg:col-span-7 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
              <div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest font-mono">Controlo de Caixa Recente</span>
                <h3 className="text-lg font-black text-[var(--text-main)]">Últimos Registos Lançados neste Período</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Registos de despesas adicionais que podem ser eliminados imediatamente se assim o desejar.</p>
              </div>

              {/* Instant list */}
              <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-primary)]/40 max-h-[300px] overflow-y-auto w-full">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[var(--bg-primary)] text-[var(--text-muted)] border-b border-[var(--border-color)] sticky top-0 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Descrição da Despesa</th>
                      <th className="py-2.5 px-3 text-right">Valor Gasto</th>
                      <th className="py-2.5 px-3 text-center">Acção</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/40">
                    {expenses.slice(0, 8).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[var(--text-muted)] font-mono">
                          Nenhum registo de despesa localizado no caixa.
                        </td>
                      </tr>
                    ) : (
                      expenses.slice(0, 8).map((exp) => (
                        <tr key={exp.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                          <td className="py-2 px-3 font-mono text-slate-300">
                            {formatarDataPortugues(exp.data)}
                          </td>
                          <td className="py-2 px-3 text-[var(--text-main)] font-semibold truncate max-w-[200px]" title={exp.descricao}>
                            {exp.descricao}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-[var(--text-main)]">
                            {formatMZ(exp.valor)}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button
                              id={`btn-instant-del-exp-${exp.id}`}
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="text-rose-400 hover:text-rose-500 rounded p-1 hover:bg-rose-500/10 cursor-pointer transition-colors"
                              title="Eliminar este registo de imediato"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-teal-500/5 border border-teal-500/10 rounded-xl text-[10px] text-teal-300">
                💡 <strong>Dica de Organização:</strong> No cabeçalho da tabela mostramos apenas os últimos 8 lançamentos rápidos. O histórico consolidado completo de todas as datas com filtros avançados está permanentemente acessível na aba <strong>Históricos de Registos</strong>.
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: REGISTO DE DÍVIDAS ----------------- */}
        {currentTab === 'dividas' && (
          <div id="panel-dividas" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Debt Form left column */}
            <div className="lg:col-span-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
              <div>
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Canais de Contas Devedoras</span>
                <h3 className="text-lg font-black text-[var(--text-main)] flex items-center gap-2 border-b border-[var(--border-color)]/60 pb-2">
                  <AlertTriangle className="w-5 h-5 text-[var(--color-accent)]" />
                  Registar Dívida Comercial
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Registe acordos de crédito, devedores ou faturas comerciais pendentes.</p>
              </div>

              <form id="form-add-debt" onSubmit={handleAddDebt} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                    Nome Completo do Devedor *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      id="input-debt-devedor"
                      type="text"
                      required
                      placeholder="Ex: António Manuel Matsinhe"
                      value={debtDevedor}
                      onChange={(e) => setDebtDevedor(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2.5 pl-9 pr-3 text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-accent)] text-sm shadow-inner transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                    Descrição da Origem ou Motivo da Dívida *
                  </label>
                  <textarea
                    id="input-debt-descr"
                    rows={2}
                    required
                    placeholder="Ex: Compra de mercadoria ou empréstimo temporário..."
                    value={debtDescr}
                    onChange={(e) => setDebtDescr(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white placeholder-slate-600 focus:outline-none focus:border-[var(--color-accent)] text-sm shadow-inner transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                    Valor Total da Dívida (MT) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-bold font-mono">
                      MT
                    </span>
                    <input
                      id="input-debt-valor"
                      type="number"
                      step="any"
                      required
                      placeholder="0,00"
                      value={debtValor}
                      onChange={(e) => setDebtValor(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2.5 pl-12 pr-4 text-[var(--text-main)] placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent)] font-mono text-sm shadow-inner transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1.5">
                    Prazo Limite de Liquidação *
                  </label>
                  <input
                    id="input-debt-prazo"
                    type="date"
                    required
                    value={debtPrazo}
                    onChange={(e) => setDebtPrazo(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2.5 px-3 text-white focus:outline-none focus:border-[var(--color-accent)] text-sm font-mono transition-all"
                  />
                </div>

                <div className="p-3.5 bg-indigo-950/20 border border-indigo-500/20 rounded-xl text-[10px] text-indigo-300">
                  ⚡ <strong>Liquidação Automática Instantânea:</strong> Ao fechar uma conta devedora ela sairá desta lista em aberto sendo transferida imediatamente para o histórico de contas liquidadas.
                </div>

                <button
                  id="btn-submit-debt"
                  type="submit"
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4.5 h-4.5 shrink-0" />
                  Registar Dívida
                </button>
              </form>
            </div>

            {/* Active debts list right column */}
            <div className="lg:col-span-7 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">Auditoria de Crédito</span>
                <h3 className="text-lg font-black text-[var(--text-main)]">Dívidas Ativas e Recebimentos (Em Aberto)</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Contas em aberto com controle contra atrasos fiscais e alerta de vencimento.</p>
              </div>

              {/* Overdue alert summary widget box */}
              {debts.filter(d => !d.fechado).map(d => {
                const state = getDebtAlertState(d.prazo, d.fechado);
                if (!state.alert) return null;
                return (
                  <div key={`alert-active-${d.id}`} className={`p-3 border rounded-xl flex items-center justify-between text-xs transition-colors shadow-sm ${state.color}`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Prazo Esgotado para {d.devedor}</p>
                        <p className="text-[10px] opacity-90">{d.descr} &bull; <strong className="font-mono">{formatMZ(d.valorTotal)}</strong></p>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] uppercase py-0.5 px-1.5 bg-slate-900 border border-slate-700/30 rounded-md whitespace-nowrap">
                      {state.text}
                    </span>
                  </div>
                );
              }).filter(Boolean).length === 0 && (
                <div className="p-3.5 bg-emerald-950/25 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  Nenhuma dívida ativa pendente fora do prazo! Balanços estão saudáveis.
                </div>
              )}

              {/* Table with active only */}
              <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-primary)]/40 max-h-[300px] overflow-y-auto w-full">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[var(--bg-primary)] text-[var(--text-muted)] border-b border-[var(--border-color)] sticky top-0 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Prazo</th>
                      <th className="py-2.5 px-3">Devedor & Origem</th>
                      <th className="py-2.5 px-3 text-right">Valor Total</th>
                      <th className="py-2.5 px-3 text-center">Ação Contábil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/40">
                    {debts.filter(d => !d.fechado).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-[var(--text-muted)] font-mono">
                          Nenhum compromisso de dívida em aberto registrado.
                        </td>
                      </tr>
                    ) : (
                      debts.filter(d => !d.fechado).map((debt) => (
                        <tr key={debt.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-350">
                            {formatarDataPortugues(debt.prazo)}
                          </td>
                          <td className="py-2.5 px-3">
                            <p className="font-bold text-[var(--text-main)]">{debt.devedor}</p>
                            <p className="text-[10px] text-[var(--text-muted)] italic truncate max-w-[150px]">{debt.descr}</p>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-main)]">
                            {formatMZ(debt.valorTotal)}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                id={`btn-close-debt-act-${debt.id}`}
                                onClick={() => handleCloseDebt(debt.id)}
                                className="text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 rounded py-1 px-2 transition-all flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer"
                                title="Liquidar e recolher dinheiro da conta aberta imediatamente"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                Fechar
                              </button>
                              <button
                                id={`btn-del-active-debt-${debt.id}`}
                                onClick={() => handleDeleteDebt(debt.id)}
                                className="text-rose-400 hover:text-rose-500 rounded p-1 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                title="Eliminar dívida do livro comercial"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: CÁLCULOS TOTAIS ----------------- */}
        {currentTab === 'calculos' && (
          <div id="panel-calculos" className="space-y-6">
            
            {/* Introductory Report Banner */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div>
                <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-widest font-mono">Indicadores Avançados e Consolidação</span>
                <h3 className="text-lg sm:text-xl font-black text-[var(--text-main)]">Aba de Cálculos Totais e Períodos de Caixa</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">Balanço simplificado obtido a partir de dados registados para análises periódicas.</p>
              </div>

              {/* Statistical Formulas section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 pt-4 border-t border-[var(--border-color)]/50">
                <div className="p-3 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl">
                  <span className="text-[10px] font-bold uppercase block text-[var(--text-muted)] mb-1 font-mono">Fórmula Analítica de Custos</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <code className="text-emerald-400 font-mono bg-emerald-950/40 p-1 px-1.5 rounded text-[10px]">Custo Total = Gastos Realizados + Dívidas Ativas</code>
                  </p>
                </div>
                <div className="p-3 bg-[var(--bg-primary)] border border border-[var(--border-color)] rounded-xl">
                  <span className="text-[10px] font-bold uppercase block text-[var(--text-muted)] mb-1 font-mono">Quociente de Compromisso</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <code className="text-amber-400 font-mono bg-amber-950/40 p-1 px-1.5 rounded text-[10px]">Taxa de Débito: {totalAbsolutoGasto > 0 ? ((totalAbsolutoAbertoDivida / (totalAbsolutoGasto + totalAbsolutoAbertoDivida)) * 100).toFixed(1) : 0}%</code>
                  </p>
                </div>
                <div className="p-3 bg-[var(--bg-primary)] border border border-[var(--border-color)] rounded-xl">
                  <span className="text-[10px] font-bold uppercase block text-[var(--text-muted)] mb-1 font-mono">Capacidade Comercial (MZ)</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    <code className="text-indigo-400 font-mono bg-indigo-950/40 p-1 px-1.5 rounded text-[10px]">Comprometimento: {formatMZ(totalAbsolutoGasto + totalAbsolutoAbertoDivida)}</code>
                  </p>
                </div>
              </div>
            </div>

            {/* Bento statistics grid calculations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* DIARIO CARD */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--border-color)]/50 pb-2.5">
                  <h4 className="text-xs font-black uppercase text-emerald-400 flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Cálculo Diário
                  </h4>
                  <span className="text-[8.5px] bg-slate-500/10 text-[var(--text-muted)] font-mono font-bold px-2 py-0.5 rounded-md">1 Dia</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-[var(--bg-primary)]/50 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase font-mono">Dinheiro Gasto</span>
                    <p className="font-mono text-lg font-black text-[var(--text-main)]">{formatMZ(totalGastoHoje)}</p>
                  </div>
                  <div className="p-2.5 bg-[var(--bg-primary)]/50 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase font-mono">Dívidas Críticas</span>
                    <p className="font-mono text-lg font-black text-rose-400">{formatMZ(totalDividaHoje)}</p>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-[var(--border-color)]/25 text-[10px] text-[var(--text-muted)] italic font-medium">
                  Custo global hoje de {formatMZ(totalGastoHoje + totalDividaHoje)}
                </div>
              </div>

              {/* SEMANAL CARD */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--border-color)]/50 pb-2.5">
                  <h4 className="text-xs font-black uppercase text-amber-400 flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                    Cálculo Semanal
                  </h4>
                  <span className="text-[8.5px] bg-slate-500/10 text-[var(--text-muted)] font-mono font-bold px-2 py-0.5 rounded-md">7 Dias</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-[var(--bg-primary)]/50 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase font-mono">Dinheiro Gasto</span>
                    <p className="font-mono text-lg font-black text-[var(--text-main)]">{formatMZ(totalGastoSemana)}</p>
                  </div>
                  <div className="p-2.5 bg-[var(--bg-primary)]/50 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase font-mono">Dívidas com Prazo</span>
                    <p className="font-mono text-lg font-black text-rose-400">{formatMZ(totalDividaSemana)}</p>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-[var(--border-color)]/25 text-[10px] text-[var(--text-muted)] italic font-medium">
                  Custo global semanal de {formatMZ(totalGastoSemana + totalDividaSemana)}
                </div>
              </div>

              {/* MENSAL CARD */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--border-color)]/50 pb-2.5">
                  <h4 className="text-xs font-black uppercase text-indigo-400 flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    Cálculo Mensal
                  </h4>
                  <span className="text-[8.5px] bg-slate-500/10 text-[var(--text-muted)] font-mono font-bold px-2 py-0.5 rounded-md">30 Dias</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-[var(--bg-primary)]/50 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase font-mono">Dinheiro Gasto</span>
                    <p className="font-mono text-lg font-black text-[var(--text-main)]">{formatMZ(totalGastoMes)}</p>
                  </div>
                  <div className="p-2.5 bg-[var(--bg-primary)]/50 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase font-mono">Dívidas do Mês</span>
                    <p className="font-mono text-lg font-black text-rose-400">{formatMZ(totalDividaMes)}</p>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-[var(--border-color)]/25 text-[10px] text-[var(--text-muted)] italic font-medium">
                  Custo global mensal de {formatMZ(totalGastoMes + totalDividaMes)}
                </div>
              </div>

              {/* ANUAL CARD */}
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 shadow-lg space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-[var(--border-color)]/50 pb-2.5">
                  <h4 className="text-xs font-black uppercase text-purple-400 flex items-center gap-1.5 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                    Cálculo Anual
                  </h4>
                  <span className="text-[8.5px] bg-slate-500/10 text-[var(--text-muted)] font-mono font-bold px-2 py-0.5 rounded-md">365 Dias</span>
                </div>
                <div className="space-y-2">
                  <div className="p-2.5 bg-[var(--bg-primary)]/50 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase font-mono">Dinheiro Gasto</span>
                    <p className="font-mono text-lg font-black text-[var(--text-main)]">{formatMZ(totalGastoAno)}</p>
                  </div>
                  <div className="p-2.5 bg-[var(--bg-primary)]/50 rounded-xl space-y-0.5">
                    <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase font-mono">Dívidas Anuais</span>
                    <p className="font-mono text-lg font-black text-rose-400">{formatMZ(totalDividaAno)}</p>
                  </div>
                </div>
                <div className="pt-1.5 border-t border-[var(--border-color)]/25 text-[10px] text-[var(--text-muted)] italic font-medium">
                  Custo global anual de {formatMZ(totalGastoAno + totalDividaAno)}
                </div>
              </div>

            </div>

            {/* Visual representation of distributions across the calendar year */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
              <h4 className="text-xs font-black text-[var(--text-main)] uppercase tracking-wider font-sans">
                Distribuição Gráfica de Percentagem de Custos Mensais por Lançamento
              </h4>
              <p className="text-xs text-[var(--text-muted)]">Cálculo proporcional de cada mês comparando gastos realizados contra o volume total histórico:</p>
              
              <div className="space-y-3.5 pt-2">
                {[
                  { m: '01', label: 'Janeiro' },
                  { m: '02', label: 'Fevereiro' },
                  { m: '03', label: 'Março' },
                  { m: '04', label: 'Abril' },
                  { m: '05', label: 'Maio' },
                  { m: '06', label: 'Junho' },
                  { m: '07', label: 'Julho' },
                  { m: '08', label: 'Agosto' },
                  { m: '09', label: 'Setembro' },
                  { m: '10', label: 'Outubro' },
                  { m: '11', label: 'Novembro' },
                  { m: '12', label: 'Dezembro' }
                ].map(item => {
                  const monthlySum = expenses.filter(e => e.data.split('-')[1] === item.m).reduce((a, b) => a + b.valor, 0);
                  const activeDebtSum = debts.filter(d => !d.fechado && d.prazo.split('-')[1] === item.m).reduce((a, b) => a + b.valorTotal, 0);
                  const totalPeriodMetric = monthlySum + activeDebtSum;
                  
                  const absoluteDenominator = totalAbsolutoGasto + totalAbsolutoAbertoDivida;
                  const ratioPercent = absoluteDenominator > 0 ? (totalPeriodMetric / absoluteDenominator) * 100 : 0;
                  
                  return (
                    <div key={item.m} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="font-bold text-[var(--text-main)]">{item.label}</span>
                        <span className="text-[var(--text-muted)] flex gap-2">
                          <span>Despesa: {formatMZ(monthlySum)}</span>
                          <span>&bull;</span>
                          <span>Crédito: {formatMZ(activeDebtSum)}</span>
                          <span className="text-[var(--color-accent)] font-bold">({ratioPercent.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-[var(--bg-primary)] rounded-full h-2 overflow-hidden border border-[var(--border-color)]/40">
                        <div 
                          className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-500" 
                          style={{ width: `${Math.max(ratioPercent, ratioPercent > 0 ? 1.5 : 0)}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ----------------- TAB: HISTÓRICO DE REGISTOS (MÓDULO DE FOLDER COMPLETO) ----------------- */}
        {currentTab === 'historicos' && (
          <div id="panel-historicos" className="space-y-6">
            
            {/* General Filter Board */}
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-[var(--text-main)]">Base de Dados e Auditoria Consolidada</h3>
                <p className="text-xs text-[var(--text-muted)]">Consulte, pesquise, filtre e limpe permanentemente ficheiros do seu livro diário de Maputo.</p>
              </div>

              {/* Month filter select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase whitespace-nowrap">Filtrar por Mês:</span>
                <select
                  id="historical-month-dropdown"
                  value={selectedMonthFilter}
                  onChange={(e) => setSelectedMonthFilter(e.target.value)}
                  className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-2 text-xs font-bold text-[var(--text-main)] focus:outline-none focus:border-[var(--color-accent)] cursor-pointer"
                >
                  {monthsList.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Split layout for Expenses History vs Closed/Paid Debts History */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* EXPENSES HISTORIC CONTAINER */}
              <div className="lg:col-span-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
                <div className="border-b border-[var(--border-color)]/60 pb-3">
                  <h4 className="text-sm font-black text-rose-450 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                    Histórico Geral de Despesas Registadas ({filteredExpenses.length})
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Lançamentos de dinheiro gasto passíveis de exclusão imediata.</p>
                </div>

                {/* Instant search input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    id="input-expense-historical-search"
                    type="text"
                    placeholder="Pesquisar neste histórico de gastos..."
                    value={expenseSearch}
                    onChange={(e) => setExpenseSearch(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2.5 pl-9 pr-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                {/* Table for Expenses */}
                <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-primary)]/45 max-h-[350px] overflow-y-auto w-full">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[var(--bg-primary)] text-[var(--text-muted)] border-b border-[var(--border-color)] sticky top-0 uppercase font-black text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Data</th>
                        <th className="py-2.5 px-3">Origem/Gasto</th>
                        <th className="py-2.5 px-3 text-right">Valor Pago</th>
                        <th className="py-2.5 px-3 text-center">Acção</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/40">
                      {filteredExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-[var(--text-muted)] font-mono">
                            Nenhum registo de despesa localizado com os filtros aplicados.
                          </td>
                        </tr>
                      ) : (
                        filteredExpenses.map((exp) => (
                          <tr key={exp.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors">
                            <td className="py-2.5 px-3 font-mono font-semibold text-slate-350 whitespace-nowrap">
                              {formatarDataPortugues(exp.data)}
                            </td>
                            <td className="py-2.5 px-3 text-[var(--text-main)] truncate max-w-[150px]" title={exp.descricao}>
                              {exp.descricao}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-[var(--text-main)]">
                              {formatMZ(exp.valor)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                id={`btn-del-exp-hist-${exp.id}`}
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="text-rose-400 hover:text-rose-500 rounded p-1 hover:bg-rose-500/10 cursor-pointer transition-colors"
                                title="Eliminar definitivamente do livro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CLOSED/SETTLED DEBTS HISTORIC CONTAINER */}
              <div className="lg:col-span-6 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl space-y-4">
                <div className="border-b border-[var(--border-color)]/60 pb-3">
                  <h4 className="text-sm font-black text-emerald-455 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                    Histórico de Dívidas Liquidadas (Fechadas) ({filteredDebts.filter(d => d.fechado).length})
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">Dívidas encerradas e cobradas livres para eliminação permanente.</p>
                </div>

                {/* Instant search input */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    id="input-debt-historical-search"
                    type="text"
                    placeholder="Pesquisar neste histórico de dívidas encerradas..."
                    value={debtSearch}
                    onChange={(e) => setDebtSearch(e.target.value)}
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2.5 pl-9 pr-4 text-xs text-[var(--text-main)] focus:outline-none focus:border-[var(--color-accent)]"
                  />
                </div>

                {/* Table for closed debts */}
                <div className="overflow-x-auto rounded-xl border border-[var(--border-color)]/60 bg-[var(--bg-primary)]/45 max-h-[350px] overflow-y-auto w-full">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-[var(--bg-primary)] text-[var(--text-muted)] border-b border-[var(--border-color)] sticky top-0 uppercase font-black text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Liquidado Em</th>
                        <th className="py-2.5 px-3">Devedor & Origem</th>
                        <th className="py-2.5 px-3 text-right">Valor Pago</th>
                        <th className="py-2.5 px-3 text-center">Acção</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]/40">
                      {filteredDebts.filter(d => d.fechado).length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-[var(--text-muted)] font-mono">
                            Nenhum registo de dívida liquidada localizado no histórico.
                          </td>
                        </tr>
                      ) : (
                        filteredDebts.filter(d => d.fechado).map((debt) => (
                          <tr key={debt.id} className="hover:bg-[var(--bg-secondary)]/50 transition-colors opacity-80">
                            <td className="py-2.5 px-3 font-mono font-semibold text-emerald-450 whitespace-nowrap">
                              {debt.pagoEm ? formatarDataPortugues(debt.pagoEm) : formatarDataPortugues(debt.prazo)}
                            </td>
                            <td className="py-2.5 px-3">
                              <p className="font-bold text-[var(--text-main)] line-through decoration-slate-600">{debt.devedor}</p>
                              <p className="text-[10px] text-[var(--text-muted)] italic truncate max-w-[130px]">{debt.descr}</p>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                              {formatMZ(debt.valorTotal)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <button
                                id={`btn-del-closed-debt-hist-${debt.id}`}
                                onClick={() => handleDeleteDebt(debt.id)}
                                className="text-rose-450 hover:text-rose-500 rounded p-1 hover:bg-rose-500/10 cursor-pointer transition-colors"
                                title="Eliminar definitivamente do livro"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ----------------- TAB: DEFINIÇÕES & PERFIL ----------------- */}
        {currentTab === 'definicoes' && (
          <div id="panel-definicoes" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Theme, typography customization Panel */}
            <div className="lg:col-span-5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl transition-colors space-y-6">
              
              <div>
                <h3 className="text-base font-black mb-1.5 flex items-center gap-1.5 border-b border-[var(--border-color)]/50 pb-2">
                  <Palette className="w-5 h-5 text-[var(--color-accent)]" />
                  Personalização do Tema Visual
                </h3>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Escolha um ambiente de cores confortável para a manipulação dos balanços:
                </p>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => onUpdateSettings({ ...settings, themeMode: 'dark' })}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                      settings.themeMode === 'dark' ? 'bg-slate-850 border-emerald-500 py-3 px-4' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-950 border border-slate-800 block"></span>
                      Modo Escuro Padrão (Slate)
                    </span>
                    {settings.themeMode === 'dark' && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ ...settings, themeMode: 'light' })}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                      settings.themeMode === 'light' ? 'bg-white text-slate-950 border-teal-600' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-400 block"></span>
                      Modo Claro Nítido
                    </span>
                    {settings.themeMode === 'light' && <Check className="w-4 h-4 text-teal-650 shrink-0" />}
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ ...settings, themeMode: 'emerald' })}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                      settings.themeMode === 'emerald' ? 'bg-emerald-900 border-amber-500 text-amber-200' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-950 border border-emerald-800 block"></span>
                      Modo Floresta Esmeralda
                    </span>
                    {settings.themeMode === 'emerald' && <Check className="w-4 h-4 text-amber-500 shrink-0" />}
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ ...settings, themeMode: 'sunset' })}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                      settings.themeMode === 'sunset' ? 'bg-amber-950 border-orange-500 text-amber-100' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-950 border border-amber-900 block"></span>
                      Modo Entardecer (Sunset)
                    </span>
                    {settings.themeMode === 'sunset' && <Check className="w-4 h-4 text-orange-500 shrink-0" />}
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ ...settings, themeMode: 'royal-blue' })}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all ${
                      settings.themeMode === 'royal-blue' ? 'bg-blue-950 border-blue-400 text-blue-100' : 'bg-slate-900/40 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-blue-900 border border-blue-950 block"></span>
                      Modo Real Azul Índigo
                    </span>
                    {settings.themeMode === 'royal-blue' && <Check className="w-4 h-4 text-blue-400 shrink-0" />}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-black mb-1.5 flex items-center gap-1.5 border-b border-[var(--border-color)]/50 pb-2">
                  <Type className="w-5 h-5 text-[var(--color-accent)]" />
                  Tipografia e Fontes
                </h3>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Escolha o tipo de letra e tamanho que melhor facilite a sua leitura de balancetes:
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1.5">Família de Letra</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { type: 'sans', label: 'Inter (Moderna)' },
                        { type: 'display', label: 'Space G (Estilo)' },
                        { type: 'mono', label: 'JetBrains M (Mono)' },
                        { type: 'serif', label: 'Playfair (Clássica)' }
                      ].map(f => (
                        <button
                          key={f.type}
                          onClick={() => onUpdateSettings({ ...settings, fontType: f.type as any })}
                          className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                            settings.fontType === f.type ? 'bg-[var(--color-accent)] text-black border-transparent' : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)]'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase mb-1.5">Tamanho da Letra</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { size: 'small', label: 'Pequena' },
                        { size: 'medium', label: 'Média' },
                        { size: 'large', label: 'Grande' }
                      ].map(s => (
                        <button
                          key={s.size}
                          onClick={() => onUpdateSettings({ ...settings, fontSize: s.size as any })}
                          className={`p-2.5 rounded-lg border text-xs font-bold transition-all ${
                            settings.fontSize === s.size ? 'bg-[var(--color-accent)] text-black border-transparent' : 'bg-transparent border-[var(--border-color)] text-[var(--text-muted)]'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Profile editing Column */}
            <div className="lg:col-span-7 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 shadow-xl transition-colors">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2 border-b border-[var(--border-color)]/60 pb-2.5">
                <User className="w-5 h-5 text-[var(--color-accent)]" />
                Editar Dados Pessoais do Utilizador
              </h3>

              {settingsSuccess && (
                <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-550/30 text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-bold uppercase tracking-wide">
                  <Check className="w-4 h-4 text-emerald-400" />
                  {settingsSuccess}
                </div>
              )}

              <form id="form-update-profile" onSubmit={handleUpdateProfileSubmit} className="space-y-4">
                
                {/* Photo Update sector */}
                <div className="p-4 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[var(--color-accent)] shrink-0 bg-slate-900 flex items-center justify-center">
                    <img src={editFotoUrl} alt="Visualizacao Perfil" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <p className="text-xs font-bold text-[var(--text-main)]">Alterar Imagem de Perfil do Livro</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Submeta um ficheiro de imagem local ou escolha entre os presets:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                      ].map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditFotoUrl(preset)}
                          className={`w-7 h-7 rounded-lg overflow-hidden border transition-all ${
                            editFotoUrl === preset ? 'border-[var(--color-accent)] scale-105' : 'border-transparent opacity-60'
                          }`}
                        >
                          <img src={preset} alt="preset" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="bg-[var(--bg-card)] text-xs font-bold py-1.5 px-3 rounded-lg border border-[var(--border-color)] cursor-pointer text-[var(--text-main)] hover:opacity-85 transition-opacity inline-flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        Submeter Nova Imagem
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSettingsPhotoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Profile Grid formulation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Primeiro Nome *</label>
                    <input
                      id="edit-firstname"
                      type="text"
                      required
                      value={editPrimeiroNome}
                      onChange={(e) => setEditPrimeiroNome(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--color-accent)] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Apelido *</label>
                    <input
                      id="edit-lastname"
                      type="text"
                      required
                      value={editApelido}
                      onChange={(e) => setEditApelido(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--color-accent)] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Caudal de Email *</label>
                    <input
                      id="edit-email"
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--color-accent)] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Número de Telefone</label>
                    <input
                      id="edit-phone"
                      type="tel"
                      value={editTelefone}
                      onChange={(e) => setEditTelefone(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--color-accent)] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Cidade localizada</label>
                    <input
                      id="edit-city"
                      type="text"
                      value={editCidade}
                      onChange={(e) => setEditCidade(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-[var(--text-main)] focus:outline-none focus:border-[var(--color-accent)] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-1 font-mono">Nome de Usuário (Username)</label>
                    <input
                      type="text"
                      disabled
                      value={user.username}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl py-2 px-3 text-slate-500 cursor-not-allowed text-sm font-mono"
                      title="O nome de usuário é auditado e imutável."
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-3">
                  <button
                    id="btn-save-profile"
                    type="submit"
                    className="flex-1 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-black font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    Guardar Informações
                  </button>
                </div>

              </form>

            </div>

          </div>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="border-t border-[var(--border-color)]/50 mt-12 py-6 bg-[var(--bg-secondary)]/40 text-center text-xs text-[var(--text-muted)]">
        <p>&copy; 2026 Contabilidade em Tempo Real &bull; Todos os direitos reservados para Moçambique.</p>
        <p id="audit-signature" className="font-mono text-[10px] mt-1 text-[var(--text-muted)]">
          Audit Sign: MD5-MZ-A39281B &bull; Proteção de Credor Activa
        </p>
      </footer>

    </div>
  );
}
