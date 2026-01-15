import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Settings as SettingsIcon, 
  CreditCard, 
  DollarSign, 
  ChevronLeft, 
  Save, 
  TrendingUp,
  Percent,
  Banknote
} from 'lucide-react';
import { Rate, CalculationMode, CalculationResult } from './types';

// --- Constants ---
const DEFAULT_PROFIT_MARGIN = 4.5; // 4.5%
const COMMISSION_RATE = 0.30; // 30%

const INITIAL_RATES: Rate[] = [
  { parcelas: 1, taxa: 3.15 }, { parcelas: 2, taxa: 5.16 },
  { parcelas: 3, taxa: 5.87 }, { parcelas: 4, taxa: 6.59 },
  { parcelas: 5, taxa: 7.29 }, { parcelas: 6, taxa: 8.00 },
  { parcelas: 7, taxa: 9.24 }, { parcelas: 8, taxa: 9.93 },
  { parcelas: 9, taxa: 10.61 }, { parcelas: 10, taxa: 11.27 },
  { parcelas: 11, taxa: 11.94 }, { parcelas: 12, taxa: 12.61 },
  { parcelas: 13, taxa: 13.26 }, { parcelas: 14, taxa: 13.90 },
  { parcelas: 15, taxa: 14.55 }, { parcelas: 16, taxa: 15.18 },
  { parcelas: 17, taxa: 15.81 }, { parcelas: 18, taxa: 16.43 }
];

// --- Helpers ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const parseCurrency = (value: string): number => {
  const numericValue = value.replace(/\D/g, '');
  return Number(numericValue) / 100;
};

// --- Components ---

interface SettingsProps {
  rates: Rate[];
  profitMargin: number;
  onSave: (newRates: Rate[], newMargin: number) => void;
  onBack: () => void;
}

const SettingsScreen: React.FC<SettingsProps> = ({ rates, profitMargin, onSave, onBack }) => {
  const [localRates, setLocalRates] = useState<Rate[]>(JSON.parse(JSON.stringify(rates)));
  const [localMargin, setLocalMargin] = useState<string>(profitMargin.toString());

  const handleRateChange = (index: number, newVal: string) => {
    const updated = [...localRates];
    updated[index].taxa = parseFloat(newVal) || 0;
    setLocalRates(updated);
  };

  const handleSave = () => {
    onSave(localRates, parseFloat(localMargin) || 0);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      <header className="bg-white shadow-sm px-4 py-4 sticky top-0 z-10 flex items-center justify-between">
        <button onClick={onBack} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">Configurações</h1>
        <div className="w-8" /> 
      </header>

      <main className="flex-1 p-4 pb-24 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> Margem de Lucro Global
          </h2>
          <div className="relative">
            <input
              type="number"
              value={localMargin}
              onChange={(e) => setLocalMargin(e.target.value)}
              className="w-full text-lg font-semibold border-b-2 border-slate-200 py-2 focus:border-royal-600 focus:outline-none bg-transparent text-slate-900"
              placeholder="0.0"
            />
            <span className="absolute right-0 top-3 text-slate-400 font-bold">%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Esta porcentagem será aplicada sobre o valor líquido para calcular seu lucro.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <Percent size={16} /> Taxas da Maquininha
          </h2>
          <div className="divide-y divide-slate-100">
            {localRates.map((rate, idx) => (
              <div key={rate.parcelas} className="flex items-center justify-between p-4 hover:bg-slate-50">
                <span className="font-medium text-slate-700 w-12">{rate.parcelas}x</span>
                <div className="relative w-24">
                  <input
                    type="number"
                    value={rate.taxa}
                    onChange={(e) => handleRateChange(idx, e.target.value)}
                    className="w-full text-right font-medium bg-transparent border-b border-slate-200 focus:border-royal-600 focus:outline-none text-slate-900"
                  />
                  <span className="absolute right-[-14px] top-0 text-slate-400 text-sm">%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200">
        <button 
          onClick={handleSave}
          className="w-full bg-royal-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-royal-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Salvar Alterações
        </button>
      </div>
    </div>
  );
};

// --- Main Calculator ---

const App: React.FC = () => {
  const [view, setView] = useState<'calculator' | 'settings'>('calculator');
  const [rates, setRates] = useState<Rate[]>(INITIAL_RATES);
  const [profitMargin, setProfitMargin] = useState<number>(DEFAULT_PROFIT_MARGIN);

  // Calculator State
  const [mode, setMode] = useState<CalculationMode>('borrow');
  const [inputValue, setInputValue] = useState<string>(''); // Raw string for input mask
  const [installments, setInstallments] = useState<number>(12);

  const numericAmount = useMemo(() => parseCurrency(inputValue), [inputValue]);

  // Logic Core
  const result: CalculationResult = useMemo(() => {
    const selectedRateObj = rates.find(r => r.parcelas === installments);
    const ratePercent = selectedRateObj ? selectedRateObj.taxa : 0;
    const rateDecimal = ratePercent / 100;
    const marginDecimal = profitMargin / 100;

    if (numericAmount === 0) {
      return { totalCharge: 0, clientReceives: 0, installmentValue: 0, machineCost: 0, profit: 0, commission: 0 };
    }

    if (mode === 'borrow') {
      // MODO A: Quero Emprestar (Client receives X, we calculate Total to charge)
      // Formula: Total = ClientWants * ((1 + Margin) / (1 - Rate))
      
      const clientWants = numericAmount;
      const numerator = 1 + marginDecimal;
      const denominator = 1 - rateDecimal;
      
      const totalCharge = clientWants * (numerator / denominator);
      const installmentValue = totalCharge / installments;
      const machineCost = totalCharge * rateDecimal;
      
      // Calculate Profit backwards to verify
      // Net = Total - MachineCost
      // Profit = Net - ClientWants
      const net = totalCharge - machineCost;
      const profit = net - clientWants;

      return {
        totalCharge,
        clientReceives: clientWants,
        installmentValue,
        machineCost,
        profit,
        commission: profit * COMMISSION_RATE
      };

    } else {
      // MODO B: Tenho Limite (Limit is X, calculate Client Receives)
      // 1. Cost = Total * Rate
      // 2. Net = Total - Cost
      // 3. Client = Net / (1 + Margin)
      // 4. Profit = Net - Client
      
      const limitAmount = numericAmount;
      const machineCost = limitAmount * rateDecimal;
      const net = limitAmount - machineCost;
      const clientReceives = net / (1 + marginDecimal);
      const profit = net - clientReceives;

      return {
        totalCharge: limitAmount,
        clientReceives,
        installmentValue: limitAmount / installments,
        machineCost,
        profit,
        commission: profit * COMMISSION_RATE
      };
    }
  }, [mode, numericAmount, installments, rates, profitMargin]);

  const displayRateText = (() => {
    const found = rates.find(r => r.parcelas === installments);
    return found ? found.taxa.toFixed(2) : '0.00';
  })();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const formatted = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(Number(raw) / 100);
    setInputValue(formatted);
  };

  if (view === 'settings') {
    return (
      <SettingsScreen 
        rates={rates} 
        profitMargin={profitMargin} 
        onBack={() => setView('calculator')}
        onSave={(newRates, newMargin) => {
          setRates(newRates);
          setProfitMargin(newMargin);
          setView('calculator');
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 bg-white">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-royal-700">
            <div className="p-2 bg-royal-50 rounded-lg">
              <Calculator size={24} className="text-royal-600" />
            </div>
            <span className="font-bold text-xl tracking-tight">Carlin<span className="text-slate-900">App</span></span>
          </div>
          <button 
            onClick={() => setView('settings')}
            className="p-2 text-slate-400 hover:bg-slate-50 hover:text-royal-600 rounded-full transition-colors"
          >
            <SettingsIcon size={24} />
          </button>
        </div>

        {/* Toggle Mode */}
        <div className="bg-slate-100 p-1 rounded-xl flex relative">
          <div 
            className={`absolute top-1 bottom-1 w-[48%] bg-white rounded-lg shadow-sm transition-all duration-300 ease-out ${mode === 'limit' ? 'translate-x-[104%]' : 'translate-x-1'}`} 
          />
          <button 
            onClick={() => setMode('borrow')}
            className={`flex-1 relative z-10 py-3 text-sm font-bold text-center rounded-lg transition-colors ${mode === 'borrow' ? 'text-royal-700' : 'text-slate-500'}`}
          >
            Quero Emprestar
          </button>
          <button 
            onClick={() => setMode('limit')}
            className={`flex-1 relative z-10 py-3 text-sm font-bold text-center rounded-lg transition-colors ${mode === 'limit' ? 'text-royal-700' : 'text-slate-500'}`}
          >
            Tenho Limite
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 pb-8 overflow-y-auto">
        {/* Main Input */}
        <div className="mt-6 mb-8 text-center">
          <label className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2 block">
            {mode === 'borrow' ? 'Valor que o cliente quer' : 'Limite disponível no cartão'}
          </label>
          <div className="relative inline-block w-full max-w-[280px]">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">R$</span>
            <input
              type="tel"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="0,00"
              className="w-full bg-transparent text-center text-4xl font-extrabold text-slate-900 focus:outline-none placeholder:text-slate-200 py-2 border-b-2 border-transparent focus:border-royal-100 transition-colors"
            />
          </div>
        </div>

        {/* Installments Select */}
        <div className="mb-8">
          <label className="block text-slate-500 text-xs font-bold uppercase mb-2 ml-1">Parcelamento</label>
          <div className="relative">
            <select
              value={installments}
              onChange={(e) => setInstallments(Number(e.target.value))}
              className="w-full appearance-none bg-white border border-slate-200 text-slate-800 text-lg font-semibold rounded-2xl py-4 pl-4 pr-10 focus:ring-2 focus:ring-royal-500 focus:border-transparent outline-none shadow-sm"
            >
              {rates.map((r) => {
                // Show installment amount inside select for quick preview
                let previewValue = 0;
                if (mode === 'borrow') {
                   // Estimate for display logic purely
                   const marginD = profitMargin / 100;
                   const rateD = r.taxa / 100;
                   const total = numericAmount > 0 ? numericAmount * ((1 + marginD) / (1 - rateD)) : 0;
                   previewValue = total / r.parcelas;
                } else {
                   previewValue = numericAmount / r.parcelas;
                }

                return (
                  <option key={r.parcelas} value={r.parcelas}>
                    {r.parcelas}x de {numericAmount > 0 ? formatCurrency(previewValue) : '...'}
                  </option>
                );
              })}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-royal-600">
              <ChevronLeft size={20} className="-rotate-90" />
            </div>
          </div>
        </div>

        {/* Result Card */}
        <div className={`relative overflow-hidden rounded-3xl p-6 shadow-xl shadow-royal-200/50 ${mode === 'borrow' ? 'bg-royal-600' : 'bg-slate-800'}`}>
          {/* Decorative Circles */}
          <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" />
          <div className="absolute bottom-[-30px] left-[-30px] w-32 h-32 bg-black opacity-10 rounded-full blur-xl" />

          <div className="relative z-10 text-white">
            <div className="text-center mb-6">
              <p className={`text-sm font-medium opacity-80 mb-1 ${mode === 'borrow' ? 'text-royal-100' : 'text-slate-300'}`}>
                {mode === 'borrow' ? 'Total a passar na máquina' : 'Cliente recebe na mão'}
              </p>
              <h2 className="text-4xl font-bold tracking-tight">
                {formatCurrency(mode === 'borrow' ? result.totalCharge : result.clientReceives)}
              </h2>
              <div className="mt-2 inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                <CreditCard size={14} />
                <span className="font-medium">
                  {installments}x de {formatCurrency(result.installmentValue)}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-black/10 rounded-xl p-4 backdrop-blur-md">
              <div className="flex justify-between items-center text-sm">
                <span className="opacity-70 flex items-center gap-2">
                  <Banknote size={14} /> Taxa Máquina ({displayRateText}%)
                </span>
                <span className="font-medium text-red-200">- {formatCurrency(result.machineCost)}</span>
              </div>
              
              <div className="h-px bg-white/10 w-full" />
              
              <div className="flex justify-between items-center text-sm">
                 <span className="opacity-70 flex items-center gap-2">
                  <DollarSign size={14} /> Lucro Bruto
                </span>
                <span className="font-bold text-emerald-400">
                   {formatCurrency(result.profit)}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs opacity-80 pt-1">
                 <span className="flex items-center gap-2">
                   Comissão (30%)
                </span>
                <span>
                   {formatCurrency(result.commission)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-6 text-center">
           <p className="text-xs text-slate-400">
             Margem de lucro aplicada: <strong className="text-slate-600">{profitMargin.toFixed(2)}%</strong>
           </p>
        </div>
      </main>
    </div>
  );
};

export default App;