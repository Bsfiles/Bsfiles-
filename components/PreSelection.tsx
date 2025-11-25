import React, { useState, useMemo } from 'react';
import { Product, CartItem, CategoryData } from '../types';
import { Search, Plus, ArrowRight, ShoppingBag, Check, Trash2, CopyPlus } from 'lucide-react';
import { generateId } from '../constants';

interface Props {
  catalog: Product[];
  categories: CategoryData[];
  onStartShopping: (items: CartItem[]) => void;
  addNewProduct: (name: string, category: string) => void;
}

export const PreSelection: React.FC<Props> = ({ catalog, categories, onStartShopping, addNewProduct }) => {
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  // Helper to get count of instances
  const getProductCount = (productId: string) => selectedItems.filter(i => i.id === productId).length;

  const addInstance = (product: Product) => {
    const newItem: CartItem = {
      ...product,
      instanceId: generateId(),
      qty: 1,
      checked: false,
      price: 0,
      market: '',
      brand: '',
      observation: '',
      timestamp: Date.now()
    };
    setSelectedItems(prev => [...prev, newItem]);
  };

  const removeLastInstance = (productId: string) => {
    const reversed = [...selectedItems].reverse();
    const index = reversed.findIndex(i => i.id === productId);
    if (index !== -1) {
      const itemToRemove = reversed[index];
      setSelectedItems(prev => prev.filter(i => i.instanceId !== itemToRemove.instanceId));
    }
  };

  const filteredProducts = useMemo(() => {
    return catalog.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Todos' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [catalog, searchTerm, activeCategory]);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header Section */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-3xl font-black mb-2 dark:text-white bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          O que vamos comprar?
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
          Toque nos produtos para adicionar à lista. Toque várias vezes para adicionar mais.
        </p>
        
        {/* Search */}
        <div className="mt-6 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-4 text-gray-400 w-6 h-6" />
            <input 
              type="text" 
              placeholder="Digite o nome do produto..." 
              className="w-full pl-14 pr-4 py-4 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-transparent focus:border-primary-500 focus:bg-white dark:focus:bg-gray-900 transition-all font-bold text-lg dark:text-white placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && filteredProducts.length === 0 && (
             <button 
             onClick={() => {
               addNewProduct(searchTerm, 'Outros');
               setSearchTerm('');
             }}
             className="px-6 bg-green-500 hover:bg-green-600 text-white rounded-2xl flex items-center justify-center font-bold shadow-lg shadow-green-500/30 transition-all"
           >
             <Plus size={28} />
           </button>
          )}
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-2 mt-4 no-scrollbar">
          <button 
            onClick={() => setActiveCategory('Todos')}
            className={`px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-bold transition-all border-2
              ${activeCategory === 'Todos' 
                ? 'bg-gray-900 border-gray-900 dark:bg-white dark:border-white text-white dark:text-gray-900 shadow-lg' 
                : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
          >
            Todos
          </button>
          {categories.map(cat => (
            <button 
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-6 py-3 rounded-2xl whitespace-nowrap text-sm font-bold transition-all border-2
                ${activeCategory === cat.name 
                  ? 'bg-primary-500 border-primary-500 text-white shadow-lg shadow-primary-500/30' 
                  : 'bg-transparent border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {filteredProducts.map(product => {
          const count = getProductCount(product.id);
          const isSelected = count > 0;
          
          return (
            <div 
              key={product.id}
              className={`
                relative p-4 rounded-3xl transition-all duration-200 flex flex-col items-center text-center justify-between min-h-[160px]
                ${isSelected 
                  ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-500 shadow-lg shadow-primary-500/10' 
                  : 'bg-white dark:bg-dark-card border-2 border-transparent shadow-sm hover:border-gray-200 dark:hover:border-gray-700'}
              `}
            >
              <div 
                className="flex-1 flex flex-col items-center justify-center w-full cursor-pointer"
                onClick={() => addInstance(product)}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-black text-2xl mb-3 shadow-sm
                  ${isSelected ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}
                `}>
                  {product.name.charAt(0).toUpperCase()}
                </div>
                
                <h3 className={`font-bold leading-tight mb-1 ${isSelected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {product.name}
                </h3>
                <p className="text-xs font-medium text-gray-400">{product.category}</p>
              </div>

              {/* Counter Controls */}
              {isSelected && (
                <div className="flex items-center gap-3 mt-3 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-700">
                  <button 
                    onClick={() => removeLastInstance(product.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 font-bold transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span className="font-black text-gray-900 dark:text-white min-w-[20px]">{count}</span>
                  <button 
                    onClick={() => addInstance(product)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 font-bold transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* FAB */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-24 right-4 left-4 md:left-auto md:right-8 max-w-4xl mx-auto z-30 flex justify-center">
          <button 
            onClick={() => onStartShopping(selectedItems)}
            className="w-full md:w-auto shadow-2xl shadow-primary-600/40 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-4 px-8 rounded-3xl flex items-center justify-center gap-4 transform transition-all hover:scale-105 active:scale-95 text-lg"
          >
            <span>Ir para o Mercado</span>
            <div className="bg-primary-500 text-white text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <ShoppingBag size={14} />
              {selectedItems.length}
            </div>
            <ArrowRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};
