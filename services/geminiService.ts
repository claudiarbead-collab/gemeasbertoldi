
import { GoogleGenAI } from "@google/genai";
import { FinancialData } from "../types";

export const getFinancialAdvice = async (data: FinancialData, referenceMonth: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Analise os seguintes dados financeiros para o mês de ${referenceMonth}:
    
    Ganhos: ${JSON.stringify(data.earnings.filter(e => e.referenceMonth === referenceMonth))}
    Cartões de Crédito: ${JSON.stringify(data.creditCards.filter(c => c.referenceMonth === referenceMonth))}
    Contas Fixas: ${JSON.stringify(data.fixedExpenses.filter(f => f.referenceMonth === referenceMonth))}
    Gastos Diversos: ${JSON.stringify(data.diverseExpenses.filter(d => d.referenceMonth === referenceMonth))}
    
    Por favor, forneça um breve resumo (3 parágrafos) em Português sobre:
    1. A saúde financeira geral do mês.
    2. Alertas sobre gastos excessivos se houver.
    3. Sugestão de economia ou investimento baseada no saldo.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Não foi possível gerar a análise no momento.";
  }
};
