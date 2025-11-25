import React, { useState } from 'react';
import { CartItem, Purchase } from '../types';
import { Save, AlertCircle, ArrowDown, ArrowUp, DollarSign, X, Check, Store, Trash2, Edit2 } from 'lucide-react';

interface Props {
  items: CartItem[];
  history: Purchase[];
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
  onRemoveItem: (id: string) => void;
  onFinishShopping: (items: CartItem[], market: string) => void;
  onClear: () => void;
}

export const Shopping: React.FC<Props> = ({ items, history, onUpdateItem, onRemoveItem, onFinishShopping, onClear }) => {
  const [currentMarket, setCurrentMarket] = useState('');
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  // Auto-calculate totals
  const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const itemsDone = items.filter(i => i.price > 0).length;

  // Comparison Logic
  const getComparison = (itemName: string, currentPrice: number) => {
    if (!currentPrice) return null;
    let bestPrice = Infinity;
    let bestMarket = '';

    history.forEach(purchase => {
      const match = purchase.items.find(i => i.name === itemName);
      if (match) {
        const unitPrice = match.price; 
        if (unitPrice < bestPrice) {
          bestPrice = unitPrice;
          bestMarket = match.market || purchase.market;
        }
      }
    });

    if (bestPrice === Infinity) return null;

    const diff = currentPrice - bestPrice;
    return {
      diff,
      bestMarket,
      bestPrice,
      isCheaper: diff < 0,
      isSame: diff === 0,
      isMoreExpensive: diff > 0
    };
  };

  const handleFinish = () => {
    if (!currentMarket) {
      alert("Por favor, informe o nome do mercado antes de fechar.");
      return;
    }
    const finalItems = items.map(i => ({ ...i, market: currentMarket }));
    onFinishShopping(finalItems, currentMarket);
  };

  const openEditModal = (item: CartItem) => {
    setEditingItem(item);
  };

  const closeEditModal = () => {
    setEditingItem(null);
  };

  // Internal state for the modal input to avoid lag
  const [tempPrice, setTempPrice] = useState<string>('');
  const [tempQty, setTempQty] = useState<number>(1);

  React.useEffect(() => {
    if (editingItem) {
      setTempPrice(editingItem.price > 0 ? editingItem.price.toString() : '');
      setTempQty(editingItem.qty);
    }
  }, [editingItem]);

  const saveEdit = () => {
    if (editingItem) {
      onUpdateItem(editingItem.instanceId, { 
        price: parseFloat(tempPrice) || 0,
        qty: tempQty
      });
      closeEditModal();
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 animate-fade-in">
        <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-full mb-6 shadow-inner">
          <AlertCircle size={64} className="text-gray-400" />
        </div>
        <h2 className="text-3xl font-black text-gray-800 dark:text-white mb-2">Lista Vazia</h2>
        <button onClick={onClear} className="text-primary-600 font-bold hover:underline text-lg">Voltar e adicionar itens</button>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-6 animate-fade-in relative">
      {/* Sticky Header */}
      <div className="sticky top-20 z-20 bg-white/95 dark:bg-dark-card/95 backdrop-blur-xl shadow-lg p-5 rounded-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-end">
          <div className="flex-1 mr-4">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Mercado Atual</label>
             <div className="relative">
                <Store className="absolute left-0 top-1.5 w-5 h-5 text-primary-500" />
                <input 
                  type="text" 
                  placeholder="Nome do Mercado..." 
                  className="block w-full pl-7 bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-primary-500 outline-none text-xl font-black text-gray-900 dark:text-white placeholder-gray-300 transition-colors"
                  value={currentMarket}
                  onChange={(e) => setCurrentMarket(e.target.value)}
                />
             </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total a Pagar</span>
            <span className="text-3xl font-black text-primary-600 dark:text-primary-400">
              R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div className="space-y-3">
        {items.map((item, index) => {
          const hasPrice = item.price > 0;
          const comparison = getComparison(item.name, item.price);

          return (
            <div 
              key={item.instanceId} 
              className={`
                relative bg-white dark:bg-dark-card p-4 rounded-3xl shadow-sm border-2 transition-all duration-200
                ${hasPrice 
                  ? 'border-green-500/30 dark:border-green-500/30' 
                  : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Clickable Area to Open Modal */}
                <div 
                  className="flex-1 flex items-center gap-4 cursor-pointer"
                  onClick={() => openEditModal(item)}
                >
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0
                    ${hasPrice ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}
                  `}>
                    {hasPrice ? <Check size={24} /> : (index + 1)}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{item.name}</h3>
                    <p className="text-xs text-gray-400 font-medium mt-0.5">{item.qty} {item.defaultUnit}</p>
                    
                    {/* Comparison Mini-Badge */}
                    {hasPrice && comparison && !comparison.isSame && (
                      <div className={`mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${comparison.isMoreExpensive ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {comparison.isMoreExpensive ? <ArrowUp size={12}/> : <ArrowDown size={12}/>}
                        {comparison.bestMarket} {comparison.isMoreExpensive ? '+' : '-'} R${Math.abs(comparison.diff).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    {hasPrice ? (
                      <span className="text-xl font-black text-gray-900 dark:text-white block">
                        R$ {item.price.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-gray-400 block bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                        Colocar Preço
                      </span>
                    )}
                  </div>
                </div>

                {/* Delete Button - Always visible, easy to hit */}
                <button 
                  onClick={() => onRemoveItem(item.instanceId)}
                  className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-2xl transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Finish Button */}
      <div className="fixed bottom-24 right-4 left-4 max-w-4xl mx-auto">
        <button 
          onClick={handleFinish}
          disabled={itemsDone === 0}
          className={`
            w-full py-4 rounded-3xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl transition-all
            ${itemsDone > 0 
              ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-primary-900/20 transform hover:scale-105' 
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'}
          `}
        >
          <Save size={24} />
          Fechar Compra ( {itemsDone}/{items.length} )
        </button>
      </div>

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm p-6 rounded-[2rem] shadow-2xl relative">
            <button 
              onClick={closeEditModal}
              className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500"
            >
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{editingItem.name}</h3>
              <p className="text-gray-400 font-medium">Insira o valor do produto</p>
            </div>

            <div className="space-y-6">
              {/* Quantity Control */}
              <div className="flex items-center justify-center gap-6">
                 <button 
                    onClick={() => setTempQty(Math.max(1, tempQty - 1))}
                    className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-xl flex items-center justify-center"
                 > - </button>
                 <div className="flex flex-col items-center">
                    <span className="text-3xl font-black dark:text-white">{tempQty}</span>
                    <span className="text-xs font-bold text-gray-400 uppercase">{editingItem.defaultUnit}</span>
                 </div>
                 <button 
                    onClick={() => setTempQty(tempQty + 1)}
                    className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-bold text-xl flex items-center justify-center"
                 > + </button>
              </div>

              {/* Price Input */}
              <div>
                <label className="block text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Preço Unitário</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <DollarSign className="w-6 h-6 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    autoFocus
                    className="w-full text-center pl-8 pr-4 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl text-4xl font-black text-gray-900 dark:text-white outline-none border-2 border-transparent focus:border-primary-500 transition-all placeholder-gray-300"
                    value={tempPrice}
                    onChange={(e) => setTempPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Live Comparison in Modal */}
              {parseFloat(tempPrice) > 0 && getComparison(editingItem.name, parseFloat(tempPrice)) && (
                 (() => {
                   const comp = getComparison(editingItem.name, parseFloat(tempPrice))!;
                   if (comp.isSame) return null;
                   return (
                    <div className={`p-4 rounded-2xl text-center border-2 ${comp.isMoreExpensive ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                        <p className="font-bold text-lg mb-1">{comp.isMoreExpensive ? 'Mais caro!' : 'Mais barato!'}</p>
                        <p className="text-sm font-medium opacity-90">
                            {comp.bestMarket} está R$ {Math.abs(comp.diff).toFixed(2)} {comp.isMoreExpensive ? 'mais barato' : 'mais caro'}.
                        </p>
                    </div>
                   );
                 })()
              )}

              <button 
                onClick={saveEdit}
                className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-lg shadow-lg shadow-primary-500/30 transition-all active:scale-95"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
