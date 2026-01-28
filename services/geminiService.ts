
import { GoogleGenAI } from "@google/genai";

const handleApiError = (error: any) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error("Gemini API Error:", errorMessage);
  
  if (errorMessage.includes("Requested entity was not found")) {
    throw new Error("API Key issue: Please go to 'Settings' and click 'Configure Gemini Key' to set up a valid paid key.");
  }
  
  if (errorMessage.includes("API_KEY")) {
    throw new Error("API Key missing. Please configure it in the application settings.");
  }

  throw new Error(errorMessage || "Failed to connect to AI service. Please try again.");
};

export const generateMemorableSentence = async (word: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a single, rhyming, poetic sentence using the word '${word}'. It must be creative and memorable. Return only the sentence, with no explanatory text, numbering, or other formatting.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    let result = response.text.trim();
    if ((result.startsWith('"') && result.endsWith('"')) || (result.startsWith("'") && result.endsWith("'"))) {
      result = result.substring(1, result.length - 1);
    }
    result = result.replace(/\*\*/g, '');
    return result;
  } catch (error) {
    return handleApiError(error);
  }
};

export const getWordLemma = async (word: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `What is the base form (lemma) of the word '${word}'? Respond with ONLY the base form and nothing else. For example, for 'running', respond with 'run'. For 'better', respond 'good'.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text.trim().toLowerCase();
  } catch (error) {
    return handleApiError(error);
  }
};

export const translateToVietnamese = async (text: string): Promise<string> => {
  if (!text) return '';
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Translate the following English text to Vietnamese. Respond with ONLY the Vietnamese translation and nothing else: "${text}"`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    return handleApiError(error);
  }
};

export const checkWordSpelling = async (word: string): Promise<{ isValid: boolean; suggestions: string[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Is the word '${word}' a correctly spelled and common English word? If yes, respond with ONLY the word 'VALID'. If no, respond with 'INVALID:' followed by a comma-separated list of up to 3 likely correct spellings. For example, for 'wunderful', respond with 'INVALID:wonderful,wonder'. Do not provide any explanation.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    const result = response.text.trim();
    if (result.toUpperCase() === 'VALID') {
      return { isValid: true, suggestions: [] };
    }
    if (result.toUpperCase().startsWith('INVALID:')) {
      const suggestions = result.substring(8).split(',').map(s => s.trim()).filter(Boolean);
      return { isValid: false, suggestions };
    }
    return { isValid: true, suggestions: [] };
  } catch (error) {
    return handleApiError(error);
  }
};

export const suggestEnglishSentence = async (vietnameseSentence: string, guidance: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Translate the following Vietnamese sentence into English: "${vietnameseSentence}".
        ${guidance ? `Follow these instructions for the translation: "${guidance}".` : 'Provide a natural and common translation.'}
        Respond with ONLY the English sentence. Do not include any introductory text, explanations, or quotes.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return response.text.trim();
    } catch (error) {
        return handleApiError(error);
    }
};
