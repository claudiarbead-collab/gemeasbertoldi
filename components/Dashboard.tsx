
import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { FinancialData } from '../types';
import { ArrowUpRight, ArrowDownRight, Wallet, CreditCard as CardIcon } from 'lucide-react';

interface DashboardProps {
  data: FinancialData;
  reference: string;
}

const Dashboard: React.FC<DashboardProps> = ({ data, reference }) => {
  const filteredEarnings = data.earnings.filter(e => e.referenceMonth === reference);
  const filteredFixed = data.fixedExpenses.filter(f => f.referenceMonth === reference);
  const filteredDiverse = data.diverseExpenses.filter(d => d.referenceMonth === reference);
  const filteredCards = data.creditCards.filter(c => c.referenceMonth === reference);

  const totalEarnings = filteredEarnings.reduce((acc, curr) => acc + curr.amount, 0);
  const totalFixed = filteredFixed.reduce((acc, curr) => acc + curr.amount, 0);
  const totalDiverse = filteredDiverse.reduce((acc, curr) => acc + curr.amount, 0);
  const totalCards = filteredCards.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenses = totalFixed + totalDiverse + totalCards;
  const balance = totalEarnings - totalExpenses;

  const pieData = [
    { name: 'Contas Fixas', value: totalFixed, color: '#3b82f6' },
    { name: 'Diversos', value: totalDiverse, color: '#f59e0b' },
    { name: 'Cartões', value: totalCards, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  const cardStats = filteredCards.reduce((acc: any, curr) => {
    acc[curr.cardName] = (acc[curr.cardName] || 0) + curr.amount;
    return acc;
  }, {});

  const barData = Object.keys(cardStats).map(key => ({
    name: key,
    valor: cardStats[key]
  }));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryItem 
          label="Total Ganhos" 
          value={formatCurrency(totalEarnings)} 
          icon={<ArrowUpRight className="text-green-500" />}
          subtext="Entradas do mês"
        />
        <SummaryItem 
          label="Total Despesas" 
          value={formatCurrency(totalExpenses)} 
          icon={<ArrowDownRight className="text-red-500" />}
          subtext="Fixas + Diversas + Cartão"
        />
        <SummaryItem 
          label="Cartões de Crédito" 
          value={formatCurrency(totalCards)} 
          icon={<CardIcon className="text-purple-500" />}
          subtext="Acumulado faturas"
        />
        <SummaryItem 
          label="Saldo Final" 
          value={formatCurrency(balance)} 
          icon={<Wallet className={balance >= 0 ? "text-indigo-500" : "text-orange-500"} />}
          subtext="Livre para uso"
          highlight={true}
          isPositive={balance >= 0}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Distribution Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Distribuição de Gastos</h3>
          <div className="h-64">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => formatCurrency(val)} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">Sem dados suficientes para o gráfico</div>
            )}
          </div>
        </div>

        {/* Card Comparison Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Gastos por Cartão</h3>
          <div className="h-64">
             {barData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} formatter={(val: number) => formatCurrency(val)} />
                    <Bar dataKey="valor" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
             ) : (
               <div className="h-full flex items-center justify-center text-slate-400 italic">Sem lançamentos em cartões</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({ label, value, icon, subtext, highlight, isPositive }: any) => (
  <div className={`p-6 rounded-3xl border ${highlight ? (isPositive ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-orange-600 border-orange-500 text-white') : 'bg-white border-slate-200 shadow-sm'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-xl ${highlight ? 'bg-white/20' : 'bg-slate-50'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-white/70' : 'text-slate-400'}`}>{label}</span>
    </div>
    <div className="space-y-1">
      <p className={`text-2xl font-bold ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      <p className={`text-xs ${highlight ? 'text-white/60' : 'text-slate-400'}`}>{subtext}</p>
    </div>
  </div>
);

export default Dashboard;
