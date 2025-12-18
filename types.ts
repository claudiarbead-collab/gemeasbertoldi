
export type Category = 'saúde' | 'educação' | 'lazer' | 'alimentação' | 'transporte' | 'outros';

export interface CreditCardTransaction {
  id: string;
  cardName: string;
  date: string;
  amount: number;
  description: string;
  installments?: number;
  referenceMonth: string;
}

export interface Earning {
  id: string;
  source: string;
  amount: number;
  date: string;
  referenceMonth: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number;
  referenceMonth: string;
  observations?: string;
}

export interface DiverseExpense {
  id: string;
  description: string;
  category: Category;
  amount: number;
  date: string;
  referenceMonth: string;
  observations?: string;
}

export interface FinancialData {
  creditCards: CreditCardTransaction[];
  earnings: Earning[];
  fixedExpenses: FixedExpense[];
  diverseExpenses: DiverseExpense[];
}
