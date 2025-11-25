import { GoogleGenAI } from "@google/genai";
import { CartItem } from "../types";

const apiKey = process.env.API_KEY || '';

// Safely initialize, handling cases where API key might be missing in dev
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const getShoppingInsights = async (items: CartItem[]): Promise<string> => {
  if (!ai) return "API Key not configured. Unable to fetch insights.";
  if (items.length === 0) return "Adicione itens à sua lista para receber dicas inteligentes!";

  const itemList = items.map(i => `${i.qty} ${i.defaultUnit} de ${i.name}`).join(', ');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Eu tenho a seguinte lista de compras: ${itemList}. 
      Aja como um chef de cozinha e especialista em economia doméstica.
      1. Sugira UMA receita rápida que posso fazer usando principalmente esses itens.
      2. Dê UMA dica de economia ou substituição inteligente para um item caro dessa lista.
      Responda em formato curto e direto (max 100 palavras). Use emojis.`,
    });
    
    return response.text || "Não foi possível gerar dicas no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com a inteligência artificial.";
  }
};