
export const CREDIT_CARDS_CONFIG: Record<string, { closingDay: number }> = {
  'BV Clau': { closingDay: 20 },
  'Itaú Clau': { closingDay: 10 },
  'Credicard Clau': { closingDay: 25 },
  'Credicard Paulinha': { closingDay: 25 },
  'CredOn Paulinha': { closingDay: 15 },
  'Hipercard': { closingDay: 28 }
};

export const CREDIT_CARDS = Object.keys(CREDIT_CARDS_CONFIG);

export const FIXED_ACCOUNTS = [
  'Luz',
  'Água',
  'Telefone',
  'TIM Mãe',
  'TIM Paulinha',
  'TIM Clau',
  'IPTU (Março)',
  'Condomínio Apto',
  'Luz Apto',
  'Internet Apto',
  'Prestação Caixa + Seguro',
  'Combustível'
];

export const CATEGORIES = [
  'saúde',
  'educação',
  'lazer',
  'alimentação',
  'transporte',
  'outros'
];

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export const MONTHS_SHORT = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'
];
