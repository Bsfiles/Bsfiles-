import React from 'react';
import { Purchase, Product } from '../types';
import { Trash2, FileText, ChevronDown, ChevronUp, History as HistoryIcon, Award, TrendingUp, TrendingDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ------------------- Saved Purchases Component -------------------

interface SavedProps {
  purchases: Purchase[];
  onDelete: (id: string) => void;
}

export const SavedPurchases: React.FC<SavedProps> = ({ purchases, onDelete }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const generatePDF = (purchase: Purchase) => {
    const doc = new jsPDF() as any;
    
    // Simple & Beautiful PDF Header
    doc.setFillColor(33, 33, 33); 
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("SmartShop", 14, 26);
    doc.setFontSize(10);
    doc.setTextColor(200, 200, 200);
    doc.text(`Compra realizada em ${new Date(purchase.date).toLocaleDateString()}`, 14, 34);

    doc.setTextColor(0,0,0);
    doc.setFontSize(14);
    doc.text(`Mercado: ${purchase.market}`, 14, 55);
    
    doc.setFontSize(18);
    doc.setTextColor(14, 165, 233);
    doc.text(`Total: R$ ${purchase.total.toFixed(2)}`, 140, 55);

    const tableBody = purchase.items.map(item => [
      item.name,
      `${item.qty} ${item.defaultUnit}`,
      `R$ ${item.price.toFixed(2)}`,
      `R$ ${(item.price * item.qty).toFixed(2)}`
    ]);

    doc.autoTable({
      startY: 65,
      head: [['Produto', 'Qtd', 'Preço Unit.', 'Subtotal']],
      body: tableBody,
      theme: 'striped',
      headStyles: { fillColor: [50, 50, 50], textColor: 255 },
      styles: { fontSize: 11, cellPadding: 6 },
    });

    doc.save(`smartshop-compra-${purchase.date.split('T')[0]}.pdf`);
  };

  if (purchases.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
                <FileText className="text-gray-400 w-12 h-12" />
            </div>
            <p className="text-gray-400 font-medium">Você ainda não fechou nenhuma compra.</p>
        </div>
    );
  }

  // Sort by date descending
  const sortedPurchases = purchases.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className="text-3xl font-black mb-6 dark:text-white tracking-tight">Minhas Compras</h2>
      
      <div className="space-y-4">
        {sortedPurchases.map(p => (
            <div key={p.id} className="bg-white dark:bg-dark-card rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div 
                    className="p-5 flex justify-between items-center cursor-pointer active:bg-gray-50 dark:active:bg-gray-800"
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                >
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-xl text-gray-900 dark:text-white">{p.market}</span>
                        </div>
                        <span className="text-sm text-gray-500 font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">
                            {new Date(p.date).toLocaleDateString()}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="block text-2xl font-black text-primary-600 dark:text-primary-400">R$ {p.total.toFixed(2)}</span>
                        {expandedId === p.id ? <ChevronUp size={20} className="ml-auto text-gray-400"/> : <ChevronDown size={20} className="ml-auto text-gray-400"/>}
                    </div>
                </div>

                {expandedId === p.id && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-5 border-t border-gray-100 dark:border-gray-800">
                        {/* Summary of markets if applicable could go here */}
                        <ul className="mb-6 space-y-2">
                            {p.items.map((item, idx) => (
                                <li key={idx} className="flex justify-between text-sm py-2 border-b border-gray-200 dark:border-gray-800 last:border-0">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{item.qty}x {item.name}</span>
                                    <span className="font-bold text-gray-900 dark:text-white">R$ {(item.price * item.qty).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>

                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={(e) => { e.stopPropagation(); generatePDF(p); }}
                                className="py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <FileText size={18} /> PDF
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                                className="py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                <Trash2 size={18} /> Excluir
                            </button>
                        </div>
                    </div>
                )}
            </div>
        ))}
      </div>
    </div>
  );
};

// ------------------- Ranking & History Analysis Component -------------------

interface RankingProps {
  purchases: Purchase[];
  products: Product[];
  viewMode: 'ranking' | 'history';
}

export const RankingAndHistory: React.FC<RankingProps> = ({ purchases, products, viewMode }) => {
  const [selectedProduct, setSelectedProduct] = React.useState<string>('all');

  // Logic for History
  const getProductHistory = (name: string) => {
    return purchases
      .flatMap(p => p.items.filter(i => i.name === name).map(i => ({ ...i, date: p.date, marketName: p.market || i.market })))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const productList = Array.from(new Set(purchases.flatMap(p => p.items.map(i => i.name)))).sort();
  const historyData = selectedProduct !== 'all' ? getProductHistory(selectedProduct) : [];

  // Logic for Ranking
  const marketScores: Record<string, { total: number, count: number }> = {};
  purchases.forEach(p => {
      const m = p.market || 'Desconhecido';
      if(!marketScores[m]) marketScores[m] = { total: 0, count: 0};
      if (p.items.length > 0) {
        marketScores[m].total += (p.total / p.items.length); 
        marketScores[m].count += 1;
      }
  });

  const rankedMarkets = Object.entries(marketScores)
    .map(([name, data]) => ({ name, avgItemPrice: data.total / data.count }))
    .sort((a, b) => a.avgItemPrice - b.avgItemPrice);

  if (viewMode === 'history') {
    return (
        <div className="space-y-6 pb-24 animate-fade-in">
            <h2 className="text-3xl font-black mb-2 dark:text-white">Histórico do Produto</h2>
            <p className="text-gray-500 mb-6">Veja como o preço mudou ao longo do tempo.</p>
            
            <div className="bg-white dark:bg-dark-card p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <select 
                    className="w-full p-3 bg-transparent font-bold text-lg dark:text-white outline-none"
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                >
                    <option value="all">Selecione um produto...</option>
                    {productList.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>

            <div className="space-y-4">
                {selectedProduct !== 'all' && historyData.length > 0 ? historyData.map((item, idx) => (
                     <div key={idx} className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                            {idx < historyData.length - 1 && <div className="w-0.5 h-12 bg-gray-200 dark:bg-gray-700 my-1"></div>}
                        </div>
                        <div className="flex-1 bg-white dark:bg-dark-card p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white">{new Date(item.date).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500">{item.marketName}</p>
                            </div>
                            <span className="font-black text-xl text-primary-600">R$ {item.price.toFixed(2)}</span>
                        </div>
                     </div>
                )) : (
                    selectedProduct !== 'all' && <p className="text-center text-gray-400 mt-10">Sem histórico para este item.</p>
                )}
            </div>
        </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
       <h2 className="text-3xl font-black mb-2 dark:text-white">Ranking de Mercados</h2>
       <p className="text-gray-500 mb-6">Baseado na média de preços dos itens.</p>

       <div className="space-y-4">
          {rankedMarkets.map((m, idx) => (
              <div key={idx} className="relative bg-white dark:bg-dark-card p-6 rounded-3xl border-2 border-transparent hover:border-gray-100 dark:hover:border-gray-800 shadow-sm flex items-center gap-5 transition-all">
                  <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg
                    ${idx === 0 ? 'bg-yellow-400' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-400' : 'bg-gray-200 dark:bg-gray-700'}
                  `}>
                      {idx + 1}
                  </div>
                  <div className="flex-1">
                      <h3 className="font-bold text-xl dark:text-white">{m.name}</h3>
                      <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full mt-3 overflow-hidden">
                          <div className="bg-primary-500 h-full rounded-full" style={{ width: `${Math.max(10, 100 - (idx * 15))}%` }}></div>
                      </div>
                  </div>
                  <div className="text-right">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Média</span>
                      <p className="font-black text-lg text-gray-700 dark:text-gray-300">R${m.avgItemPrice.toFixed(2)}</p>
                  </div>
              </div>
          ))}
          {rankedMarkets.length === 0 && <p className="text-center text-gray-400">Nenhum dado de compra suficiente.</p>}
       </div>
    </div>
  );
};
