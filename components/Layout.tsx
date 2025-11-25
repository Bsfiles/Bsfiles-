import React from 'react';
import { 
  ListChecks, 
  ShoppingCart, 
  BarChart3, 
  History, 
  TrendingUp, 
  Archive, 
  Moon, 
  Sun,
  LayoutDashboard
} from 'lucide-react';
import { ViewState, Theme } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const NavItem: React.FC<{ 
  view: ViewState; 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string;
  theme: Theme;
}> = ({ active, onClick, icon, label, theme }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-300
      ${active 
        ? 'bg-gray-100 dark:bg-gray-800 scale-110 -translate-y-2 shadow-xl shadow-primary-500/20' 
        : 'text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
    `}
  >
    <div className={`
      mb-1 transform transition-all duration-300 
      ${active ? 'scale-110' : 'scale-100'} 
      ${theme === 'dark' ? 'icon-glossy-dark' : 'icon-glossy-light'}
    `}>
      {React.cloneElement(icon as React.ReactElement, { size: active ? 28 : 24 })}
    </div>
    <span className={`
      text-[10px] font-bold uppercase tracking-wide transition-colors duration-300
      ${active ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}
    `}>
      {label}
    </span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onChangeView, theme, toggleTheme }) => {
  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''} bg-gray-50 dark:bg-dark-bg transition-colors duration-300`}>
      {/* Header */}
      <header className="fixed top-0 w-full z-40 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 shadow-sm no-print transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`
              p-3 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 
              shadow-lg ${theme === 'dark' ? 'shadow-primary-500/20' : 'shadow-primary-500/30'}
              transform hover:scale-105 transition-transform duration-300
            `}>
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent tracking-tight">
                SmartShop
              </h1>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 tracking-wide">LISTA INTELIGENTE</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-inner"
          >
            {theme === 'light' ? 
              <Moon className="w-5 h-5 text-gray-600 icon-glossy-light" /> : 
              <Sun className="w-5 h-5 text-yellow-400 icon-glossy-dark" />
            }
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-28 px-4 max-w-4xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white dark:bg-dark-card border-t border-gray-200 dark:border-gray-800 pb-safe pt-3 px-2 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.3)] no-print">
        <div className="max-w-4xl mx-auto grid grid-cols-6 gap-2">
          <NavItem 
            theme={theme}
            view="pre-selection" 
            active={currentView === 'pre-selection'} 
            onClick={() => onChangeView('pre-selection')}
            icon={<ListChecks />}
            label="Lista"
          />
          <NavItem 
            theme={theme}
            view="shopping" 
            active={currentView === 'shopping'} 
            onClick={() => onChangeView('shopping')}
            icon={<ShoppingCart />}
            label="Compras"
          />
          <NavItem 
            theme={theme}
            view="dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => onChangeView('dashboard')}
            icon={<LayoutDashboard />}
            label="Dash"
          />
           <NavItem 
            theme={theme}
            view="ranking" 
            active={currentView === 'ranking'} 
            onClick={() => onChangeView('ranking')}
            icon={<TrendingUp />}
            label="Ranking"
          />
           <NavItem 
            theme={theme}
            view="history" 
            active={currentView === 'history'} 
            onClick={() => onChangeView('history')}
            icon={<History />}
            label="Hist."
          />
          <NavItem 
            theme={theme}
            view="saved" 
            active={currentView === 'saved'} 
            onClick={() => onChangeView('saved')}
            icon={<Archive />}
            label="Salvos"
          />
        </div>
      </nav>
    </div>
  );
};