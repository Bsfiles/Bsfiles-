import React from 'react';
import { Purchase } from '../types';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  history: Purchase[];
}

export const Dashboard: React.FC<Props> = ({ history }) => {
  const totalSpent = history.reduce((acc, h) => acc + h.total, 0);
  const totalSavings = 0; // Would require complex calculation against "most expensive" potential. Keeping it simple.

  // Prepare simple chart data: Total spent per month
  const monthlyData = history.reduce((acc: any[], curr) => {
    const month = new Date(curr.date).toLocaleDateString('pt-BR', { month: 'short' });
    const existing = acc.find(a => a.name === month);
    if (existing) {
        existing.total += curr.total;
    } else {
        acc.push({ name: month, total: curr.total });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      <h2 className="text-3xl font-black dark:text-white tracking-tight">Resumo Geral</h2>

      {/* Big Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-primary-600 p-6 rounded-[2rem] text-white shadow-xl shadow-primary-600/20 relative overflow-hidden">
            <div className="relative z-10">
                <p className="font-bold opacity-80 mb-1">Total Gasto (Geral)</p>
                <p className="text-4xl font-black">R$ {totalSpent.toFixed(2)}</p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-10 translate-y-10">
                <div className="w-48 h-48 rounded-full bg-white"></div>
            </div>
        </div>
      </div>

      {/* Simple Chart */}
      <div className="bg-white dark:bg-dark-card p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-xl mb-6 dark:text-white">Gastos por Mês</h3>
        <div className="h-64 w-full">
            {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontWeight: 'bold'}} dy={10} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{borderRadius: '16px', border: 'none', backgroundColor: '#1f2937', color: '#fff'}}
                        />
                        <Bar dataKey="total" fill="#0ea5e9" radius={[10, 10, 10, 10]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="flex items-center justify-center h-full text-gray-400 font-medium">
                    Sem dados suficientes ainda.
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
