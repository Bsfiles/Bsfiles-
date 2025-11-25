import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Layout } from './components/Layout';
import { PreSelection } from './components/PreSelection';
import { Shopping } from './components/Shopping';
import { Dashboard } from './components/Dashboard';
import { SavedPurchases, RankingAndHistory } from './components/HistoryAndSaved';
import { CartItem, Product, Purchase, ViewState, Theme } from './types';
import { INITIAL_PRODUCTS, CATEGORIES, generateId } from './constants';
import { supabase } from './services/supabase';

const App = () => {
  // --- State ---
  const [theme, setTheme] = useState<Theme>('light');
  const [view, setView] = useState<ViewState>('pre-selection');
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [activeItems, setActiveItems] = useState<CartItem[]>([]);
  const [purchaseHistory, setPurchaseHistory] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Effects ---
  
  // 1. Theme and Local Persistence for Theme only
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setTheme('dark');
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // 2. Fetch Data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      // Offline Fallback
      if (!supabase) {
        console.log("Offline mode: Using initial data.");
        setCatalog(INITIAL_PRODUCTS);
        setPurchaseHistory([]);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch Products
        const { data: productsData, error: prodError } = await supabase
          .from('products')
          .select('*');

        if (prodError) throw prodError;

        // Se o catálogo estiver vazio no banco, popula com os iniciais
        if (!productsData || productsData.length === 0) {
           // Bulk insert initial products
           const { data: newProducts, error: insertError } = await supabase
             .from('products')
             .insert(INITIAL_PRODUCTS)
             .select();
           
           if (!insertError && newProducts) {
             setCatalog(newProducts as Product[]);
           } else {
             setCatalog(INITIAL_PRODUCTS); // Fallback local
           }
        } else {
          setCatalog(productsData as Product[]);
        }

        // Fetch History
        const { data: historyData, error: histError } = await supabase
          .from('purchases')
          .select('*')
          .order('date', { ascending: false });

        if (histError) throw histError;

        if (historyData) {
          setPurchaseHistory(historyData as Purchase[]);
        }

      } catch (error) {
        console.error("Erro ao carregar dados do Supabase:", error);
        // Fallback para evitar tela branca em caso de erro de config
        setCatalog(INITIAL_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Handlers ---

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleStartShopping = (newItems: CartItem[]) => {
    setActiveItems(prev => [...prev, ...newItems]);
    setView('shopping');
  };

  const handleUpdateCartItem = (instanceId: string, updates: Partial<CartItem>) => {
    setActiveItems(prev => prev.map(item => item.instanceId === instanceId ? { ...item, ...updates } : item));
  };

  const handleRemoveCartItem = (instanceId: string) => {
    if(confirm('Remover este item do carrinho?')) {
      setActiveItems(prev => prev.filter(item => item.instanceId !== instanceId));
    }
  };

  const handleFinishShopping = async (items: CartItem[], marketName: string) => {
    const total = items.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);
    
    const newPurchase: Purchase = {
      id: generateId(),
      date: new Date().toISOString(),
      market: marketName,
      items: items,
      total: total,
      status: 'completed'
    };

    // Optimistic Update
    setPurchaseHistory(prev => [newPurchase, ...prev]);
    setActiveItems([]);
    setView('saved');

    // Save to Supabase
    if (supabase) {
      try {
        const { error } = await supabase
          .from('purchases')
          .insert({
            id: newPurchase.id,
            date: newPurchase.date,
            market: newPurchase.market,
            total: newPurchase.total,
            items: newPurchase.items, // JSONB column
            status: newPurchase.status
          });
        
        if (error) {
          console.error("Erro ao salvar compra:", error);
          alert("Erro ao salvar no banco de dados. Verifique a conexão.");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleAddNewProduct = async (name: string, category: string) => {
    const newProduct: Product = {
      id: generateId(),
      name,
      category,
      defaultUnit: 'un'
    };

    // Optimistic Update
    setCatalog(prev => [...prev, newProduct]);

    // Save to Supabase
    if (supabase) {
      try {
        await supabase.from('products').insert(newProduct);
      } catch (error) {
        console.error("Erro ao adicionar produto:", error);
      }
    }
  };

  const handleDeletePurchase = async (id: string) => {
    if(confirm('Tem certeza que deseja apagar este histórico permanentemente?')) {
      // Optimistic Update
      setPurchaseHistory(prev => prev.filter(p => p.id !== id));

      // Delete from Supabase
      if (supabase) {
        try {
          const { error } = await supabase
            .from('purchases')
            .delete()
            .eq('id', id);
          
          if (error) console.error("Erro ao deletar:", error);
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-dark-bg text-white' : 'bg-gray-50 text-gray-900'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-lg animate-pulse">
            {supabase ? "Conectando ao banco de dados..." : "Iniciando modo offline..."}
          </p>
        </div>
      </div>
    );
  }

  // --- Render View ---
  const renderView = () => {
    switch (view) {
      case 'pre-selection':
        return (
          <PreSelection 
            catalog={catalog} 
            categories={CATEGORIES}
            onStartShopping={handleStartShopping}
            addNewProduct={handleAddNewProduct}
          />
        );
      case 'shopping':
        return (
          <Shopping 
            items={activeItems}
            history={purchaseHistory}
            onUpdateItem={handleUpdateCartItem}
            onRemoveItem={handleRemoveCartItem}
            onFinishShopping={handleFinishShopping}
            onClear={() => { setActiveItems([]); setView('pre-selection'); }}
          />
        );
      case 'dashboard':
        return <Dashboard history={purchaseHistory} />;
      case 'history':
        return <RankingAndHistory purchases={purchaseHistory} products={catalog} viewMode="history" />;
      case 'ranking':
        return <RankingAndHistory purchases={purchaseHistory} products={catalog} viewMode="ranking" />;
      case 'saved':
        return <SavedPurchases purchases={purchaseHistory} onDelete={handleDeletePurchase} />;
      default:
        return null;
    }
  };

  return (
    <Layout currentView={view} onChangeView={setView} theme={theme} toggleTheme={toggleTheme}>
      {renderView()}
    </Layout>
  );
};

export default App;