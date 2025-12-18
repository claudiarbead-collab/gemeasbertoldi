
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  TrendingUp, 
  CalendarCheck, 
  ShoppingBag, 
  FileSpreadsheet,
  BrainCircuit,
  Plus,
  Trash2,
  Info
} from 'lucide-react';
import { 
  FinancialData, 
  CreditCardTransaction, 
  Earning, 
  FixedExpense, 
  DiverseExpense 
} from './types';
import { MONTHS, CREDIT_CARDS, FIXED_ACCOUNTS, CATEGORIES, CREDIT_CARDS_CONFIG, MONTHS_SHORT } from './constants';
import Dashboard from './components/Dashboard';
import FormCard from './components/FormCard';
import { getFinancialAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'cards' | 'earnings' | 'fixed' | 'diverse' | 'sheets'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());

  const [data, setData] = useState<FinancialData>(() => {
    const saved = localStorage.getItem('finance_data');
    return saved ? JSON.parse(saved) : {
      creditCards: [],
      earnings: [],
      fixedExpenses: [],
      diverseExpenses: []
    };
  });

  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('finance_data', JSON.stringify(data));
  }, [data]);

  const currentRef = `${selectedMonth} ${selectedYear}`;

  const formatRefMonth = (date: Date) => {
    return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleAdd = (type: keyof FinancialData, item: any) => {
    if (type === 'creditCards') {
      // Lógica de Explosão de Parcelas
      const { cardName, date, amount, description, installments } = item;
      const numInstallments = parseInt(installments) || 1;
      const valorTotal = parseFloat(amount);
      const valorParcela = valorTotal / numInstallments;
      const dataCompra = new Date(date + 'T12:00:00'); // Evitar problemas de timezone
      const diaCompra = dataCompra.getDate();
      const diaCorte = CREDIT_CARDS_CONFIG[cardName]?.closingDay || 32;
      
      // Se comprou no dia do fechamento ou depois, pula para o mês seguinte
      const saltoFatura = diaCompra >= diaCorte ? 1 : 0;

      const novasParcelas: CreditCardTransaction[] = [];
      const parentId = crypto.randomUUID(); // ID para agrupar parcelas se necessário no futuro

      for (let p = 1; p <= numInstallments; p++) {
        const dataVencimento = new Date(dataCompra);
        dataVencimento.setMonth(dataVencimento.getMonth() + (p - 1) + saltoFatura);
        
        const refMonth = formatRefMonth(dataVencimento);
        
        novasParcelas.push({
          id: crypto.randomUUID(),
          cardName,
          date: date, // Mantemos a data da compra original
          amount: valorParcela,
          description: numInstallments > 1 ? `${description} (${p}/${numInstallments})` : description,
          installments: numInstallments,
          referenceMonth: refMonth
        });
      }

      setData(prev => ({
        ...prev,
        creditCards: [...prev.creditCards, ...novasParcelas]
      }));
    } else {
      setData(prev => ({
        ...prev,
        [type]: [...prev[type], { ...item, id: crypto.randomUUID(), referenceMonth: currentRef }]
      }));
    }
  };

  const handleDelete = (type: keyof FinancialData, id: string) => {
    setData(prev => ({
      ...prev,
      [type]: prev[type].filter((item: any) => item.id !== id)
    }));
  };

  const triggerAiAdvice = async () => {
    setLoadingAi(true);
    const advice = await getFinancialAdvice(data, currentRef);
    setAiAdvice(advice || "Sem conselhos no momento.");
    setLoadingAi(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-800">
      <nav className="w-full md:w-64 bg-indigo-900 text-white p-6 flex flex-col sticky top-0 md:h-screen z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">FinancePro</h1>
        </div>

        <div className="space-y-2 flex-grow">
          <NavItem icon={<LayoutDashboard />} label="Resumo" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<TrendingUp />} label="Ganhos" active={activeTab === 'earnings'} onClick={() => setActiveTab('earnings')} />
          <NavItem icon={<CalendarCheck />} label="Contas Fixas" active={activeTab === 'fixed'} onClick={() => setActiveTab('fixed')} />
          <NavItem icon={<ShoppingBag />} label="Gastos Diversos" active={activeTab === 'diverse'} onClick={() => setActiveTab('diverse')} />
          <NavItem icon={<CreditCard />} label="Cartões" active={activeTab === 'cards'} onClick={() => setActiveTab('cards')} />
          <NavItem icon={<FileSpreadsheet />} label="Google Sheets" active={activeTab === 'sheets'} onClick={() => setActiveTab('sheets')} />
        </div>

        <div className="mt-auto pt-6 border-t border-indigo-800">
          <button 
            onClick={triggerAiAdvice}
            disabled={loadingAi}
            className="flex items-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 transition-colors p-3 rounded-xl text-sm font-medium disabled:opacity-50"
          >
            <BrainCircuit className="w-4 h-4" />
            {loadingAi ? "Analisando..." : "Consultar IA"}
          </button>
        </div>
      </nav>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 capitalize">{activeTab === 'dashboard' ? 'Dashboard Geral' : activeTab === 'cards' ? 'Cartões de Crédito' : activeTab}</h2>
            <p className="text-slate-500">Exibindo competência: {currentRef}</p>
          </div>

          <div className="flex gap-2">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </header>

        {aiAdvice && activeTab === 'dashboard' && (
          <div className="mb-8 bg-indigo-50 border border-indigo-100 p-6 rounded-2xl relative">
            <button onClick={() => setAiAdvice("")} className="absolute top-4 right-4 text-indigo-400 hover:text-indigo-600">×</button>
            <div className="flex gap-3 items-start">
              <BrainCircuit className="w-6 h-6 text-indigo-600 mt-1" />
              <div>
                <h3 className="font-bold text-indigo-900 mb-2">Análise Financeira IA</h3>
                <p className="text-indigo-800 whitespace-pre-line leading-relaxed">{aiAdvice}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-8">
          {activeTab === 'dashboard' && <Dashboard data={data} reference={currentRef} />}

          {activeTab === 'earnings' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <FormCard title="Novo Ganho" icon={<TrendingUp className="text-green-500" />}>
                  <EarningForm onAdd={(item) => handleAdd('earnings', item)} />
                </FormCard>
              </div>
              <div className="lg:col-span-2">
                <TransactionList 
                  title="Histórico de Ganhos" 
                  items={data.earnings.filter(e => e.referenceMonth === currentRef)}
                  onDelete={(id) => handleDelete('earnings', id)}
                  columns={[
                    { label: 'Fonte', key: 'source' },
                    { label: 'Data', key: 'date' },
                    { label: 'Valor', key: 'amount', isCurrency: true }
                  ]}
                />
              </div>
            </div>
          )}

          {activeTab === 'fixed' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <FormCard title="Conta Fixa" icon={<CalendarCheck className="text-blue-500" />}>
                  <FixedExpenseForm onAdd={(item) => handleAdd('fixedExpenses', item)} />
                </FormCard>
              </div>
              <div className="lg:col-span-2">
                <TransactionList 
                  title="Contas Fixas do Mês" 
                  items={data.fixedExpenses.filter(f => f.referenceMonth === currentRef)}
                  onDelete={(id) => handleDelete('fixedExpenses', id)}
                  columns={[
                    { label: 'Conta', key: 'name' },
                    { label: 'Valor', key: 'amount', isCurrency: true },
                    { label: 'Obs', key: 'observations' }
                  ]}
                />
              </div>
            </div>
          )}

          {activeTab === 'diverse' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <FormCard title="Gasto Diverso" icon={<ShoppingBag className="text-orange-500" />}>
                  <DiverseExpenseForm onAdd={(item) => handleAdd('diverseExpenses', item)} />
                </FormCard>
              </div>
              <div className="lg:col-span-2">
                <TransactionList 
                  title="Despesas Eventuais" 
                  items={data.diverseExpenses.filter(d => d.referenceMonth === currentRef)}
                  onDelete={(id) => handleDelete('diverseExpenses', id)}
                  columns={[
                    { label: 'Descrição', key: 'description' },
                    { label: 'Categoria', key: 'category' },
                    { label: 'Valor', key: 'amount', isCurrency: true }
                  ]}
                />
              </div>
            </div>
          )}

          {activeTab === 'cards' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <FormCard title="Lançamento Automático" icon={<CreditCard className="text-purple-500" />}>
                  <div className="mb-4 bg-purple-50 p-3 rounded-lg border border-purple-100 flex gap-2 items-start">
                    <Info className="w-4 h-4 text-purple-600 mt-1 shrink-0" />
                    <p className="text-xs text-purple-800">O sistema criará automaticamente as parcelas nos meses futuros respeitando o dia de fechamento do cartão.</p>
                  </div>
                  <CreditCardForm onAdd={(item) => handleAdd('creditCards', item)} />
                </FormCard>
              </div>
              <div className="lg:col-span-2">
                <TransactionList 
                  title={`Fatura Estimada: ${currentRef}`} 
                  items={data.creditCards.filter(c => c.referenceMonth === currentRef)}
                  onDelete={(id) => handleDelete('creditCards', id)}
                  columns={[
                    { label: 'Cartão', key: 'cardName' },
                    { label: 'Descrição', key: 'description' },
                    { label: 'Data Compra', key: 'date' },
                    { label: 'Valor Parcela', key: 'amount', isCurrency: true }
                  ]}
                />
              </div>
            </div>
          )}

          {activeTab === 'sheets' && <SheetsGuide />}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 ${
      active ? 'bg-indigo-700 text-white shadow-lg' : 'text-indigo-300 hover:bg-indigo-800'
    }`}
  >
    {React.cloneElement(icon, { className: 'w-5 h-5' })}
    <span className="font-medium">{label}</span>
  </button>
);

const TransactionList = ({ title, items, onDelete, columns }: any) => (
  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
      <h3 className="font-bold text-slate-700">{title}</h3>
      <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{items.length} itens</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {columns.map((col: any) => <th key={col.key} className="px-6 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">{col.label}</th>)}
            <th className="px-6 py-3 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((item: any) => (
            <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
              {columns.map((col: any) => (
                <td key={col.key} className="px-6 py-4 text-sm text-slate-600">
                  {col.isCurrency ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item[col.key]) : item[col.key]}
                </td>
              ))}
              <td className="px-6 py-4 text-right">
                <button onClick={() => onDelete(item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="px-6 py-10 text-center text-slate-400 italic">Nenhum registro para esta competência.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const EarningForm = ({ onAdd }: { onAdd: (v: any) => void }) => {
  const [v, setV] = useState({ source: '', amount: '', date: new Date().toISOString().split('T')[0] });
  return (
    <div className="space-y-4">
      <input type="text" placeholder="Fonte (ex: Salário)" className="w-full p-2 border rounded" value={v.source} onChange={e => setV({...v, source: e.target.value})} />
      <input type="number" placeholder="Valor" className="w-full p-2 border rounded" value={v.amount} onChange={e => setV({...v, amount: e.target.value})} />
      <input type="date" className="w-full p-2 border rounded" value={v.date} onChange={e => setV({...v, date: e.target.value})} />
      <button onClick={() => { if(!v.source || !v.amount) return; onAdd({...v, amount: parseFloat(v.amount)}); setV({source: '', amount: '', date: v.date}); }} className="w-full bg-indigo-600 text-white p-2 rounded flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Adicionar</button>
    </div>
  );
};

const FixedExpenseForm = ({ onAdd }: { onAdd: (v: any) => void }) => {
  const [v, setV] = useState({ name: FIXED_ACCOUNTS[0], amount: '', observations: '' });
  return (
    <div className="space-y-4">
      <select className="w-full p-2 border rounded" value={v.name} onChange={e => setV({...v, name: e.target.value})}>
        {FIXED_ACCOUNTS.map(a => <option key={a} value={a}>{a}</option>)}
      </select>
      <input type="number" placeholder="Valor" className="w-full p-2 border rounded" value={v.amount} onChange={e => setV({...v, amount: e.target.value})} />
      <textarea placeholder="Observações" className="w-full p-2 border rounded" value={v.observations} onChange={e => setV({...v, observations: e.target.value})} />
      <button onClick={() => { if(!v.amount) return; onAdd({...v, amount: parseFloat(v.amount)}); setV({name: FIXED_ACCOUNTS[0], amount: '', observations: ''}); }} className="w-full bg-indigo-600 text-white p-2 rounded flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Adicionar</button>
    </div>
  );
};

const DiverseExpenseForm = ({ onAdd }: { onAdd: (v: any) => void }) => {
  const [v, setV] = useState({ description: '', category: CATEGORIES[0], amount: '', date: new Date().toISOString().split('T')[0] });
  return (
    <div className="space-y-4">
      <input type="text" placeholder="Descrição" className="w-full p-2 border rounded" value={v.description} onChange={e => setV({...v, description: e.target.value})} />
      <select className="w-full p-2 border rounded" value={v.category} onChange={e => setV({...v, category: e.target.value as any})}>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <input type="number" placeholder="Valor" className="w-full p-2 border rounded" value={v.amount} onChange={e => setV({...v, amount: e.target.value})} />
      <input type="date" className="w-full p-2 border rounded" value={v.date} onChange={e => setV({...v, date: e.target.value})} />
      <button onClick={() => { if(!v.description || !v.amount) return; onAdd({...v, amount: parseFloat(v.amount)}); setV({description: '', category: CATEGORIES[0], amount: '', date: v.date}); }} className="w-full bg-indigo-600 text-white p-2 rounded flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Adicionar</button>
    </div>
  );
};

const CreditCardForm = ({ onAdd }: { onAdd: (v: any) => void }) => {
  const [v, setV] = useState({ cardName: CREDIT_CARDS[0], description: '', amount: '', date: new Date().toISOString().split('T')[0], installments: '1' });
  return (
    <div className="space-y-4">
      <label className="block text-xs font-bold text-slate-400 uppercase">Cartão</label>
      <select className="w-full p-2 border rounded" value={v.cardName} onChange={e => setV({...v, cardName: e.target.value})}>
        {CREDIT_CARDS.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      
      <label className="block text-xs font-bold text-slate-400 uppercase">Descrição da Compra</label>
      <input type="text" placeholder="Ex: TV Samsung" className="w-full p-2 border rounded" value={v.description} onChange={e => setV({...v, description: e.target.value})} />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase">Valor TOTAL</label>
          <input type="number" placeholder="0.00" className="w-full p-2 border rounded" value={v.amount} onChange={e => setV({...v, amount: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase">Parcelas</label>
          <input type="number" min="1" className="w-full p-2 border rounded" value={v.installments} onChange={e => setV({...v, installments: e.target.value})} />
        </div>
      </div>

      <label className="block text-xs font-bold text-slate-400 uppercase">Data da Compra</label>
      <input type="date" className="w-full p-2 border rounded" value={v.date} onChange={e => setV({...v, date: e.target.value})} />
      
      <button onClick={() => { 
        if(!v.description || !v.amount) return;
        onAdd(v); 
        setV({cardName: CREDIT_CARDS[0], description: '', amount: '', date: v.date, installments: '1'}); 
      }} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 hover:bg-indigo-700 transition-colors shadow-lg">
        <Plus className="w-5 h-5" /> Lançar Compra
      </button>
    </div>
  );
};

const SheetsGuide = () => (
  <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
    <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
      <FileSpreadsheet className="text-emerald-500" /> Automação Google Sheets (Fase 2)
    </h3>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <div className="space-y-4">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">1</div>
          Aba: INPUT_Cartoes
        </h4>
        <p className="text-sm text-slate-500">Onde o App ou Script registra o lançamento inicial bruto.</p>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <code className="text-xs text-emerald-700 font-bold block mb-2 uppercase">Colunas Sugeridas:</code>
          <code className="text-xs bg-white p-2 rounded block border">Data_Compra | Cartão | Descrição | Valor_Total | Qtd_Parcelas</code>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-bold text-slate-700 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</div>
          Aba: DB_Cartoes (Storage)
        </h4>
        <p className="text-sm text-slate-500">Onde as parcelas "explodidas" residem para os dashboards.</p>
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <code className="text-xs text-indigo-700 font-bold block mb-2 uppercase">Colunas Geradas:</code>
          <code className="text-xs bg-white p-2 rounded block border">Ref_Mês | Data_Fatura | Cartão | Descrição (x/y) | Valor_Parcela</code>
        </div>
      </div>
    </div>

    <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl">
      <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
        <Info className="w-5 h-5" /> Configuração de Corte de Fatura
      </h4>
      <p className="text-sm text-amber-700 leading-relaxed mb-4">
        Para o aplicativo calcular corretamente se a compra cai neste mês ou no próximo, os seguintes dias de fechamento foram configurados:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.entries(CREDIT_CARDS_CONFIG).map(([card, config]) => (
          <div key={card} className="bg-white/50 p-2 rounded-lg text-xs border border-amber-200">
            <span className="font-bold">{card}:</span> Dia {config.closingDay}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default App;
