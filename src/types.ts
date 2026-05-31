export type ThemeMode = 'light' | 'dark' | 'emerald' | 'sunset' | 'royal-blue';
export type FontSize = 'small' | 'medium' | 'large';
export type FontType = 'sans' | 'mono' | 'serif' | 'display';

export interface UserProfile {
  apelido: string;
  primeiroNome: string;
  dataNascimento: string;
  email: string;
  nacionalidade: string;
  cidade: string;
  telefone: string;
  username: string;
  codigo: string; // password
  fotoUrl: string; // Avatar URL or base64
}

export interface UserSettings {
  themeMode: ThemeMode;
  fontSize: FontSize;
  fontType: FontType;
}

export interface Expense {
  id: string;
  valor: number;
  descricao: string;
  data: string; // YYYY-MM-DD
  registradoEm: string; // timestamp
}

export interface Debt {
  id: string;
  devedor: string; // person who owes
  descr: string; // explanation / details
  valorTotal: number;
  prazo: string; // YYYY-MM-DD
  fechado: boolean; // true = paid, false = active
  pagoEm?: string; // date of payment
  registradoEm: string; // timestamp
}

export interface UserAccount {
  profile: UserProfile;
  settings: UserSettings;
  expenses: Expense[];
  debts: Debt[];
}
