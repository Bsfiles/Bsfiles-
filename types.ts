export type Unit = 'un' | 'kg' | 'g' | 'L' | 'ml' | 'pct' | 'cx';

export interface Product {
  id: string;
  name: string;
  category: string;
  defaultUnit: Unit;
}

export interface CartItem extends Product {
  instanceId: string; // ID único para diferenciar múltiplas entradas do mesmo produto
  qty: number;
  checked: boolean;
  price: number;
  market: string;
  observation?: string;
  brand?: string;
  timestamp: number;
}

export interface Purchase {
  id: string;
  date: string; // ISO date
  market: string; // Primary market or "Multiple"
  items: CartItem[];
  total: number;
  status: 'completed';
}

export interface CategoryData {
  name: string;
  items: string[];
}

export type Theme = 'light' | 'dark';

export type ViewState = 'pre-selection' | 'shopping' | 'dashboard' | 'history' | 'ranking' | 'saved';

export interface MarketStat {
  market: string;
  totalSpent: number;
  visitCount: number;
  cheapestCount: number; // Number of times this market had the item cheaper
}