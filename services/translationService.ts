const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage: string;
  confidenceScore: number;
}

export const translateText = async (
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<string> => {
  const response = await fetch(`${API_BASE_URL}/api/translation/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      targetLanguage,
      sourceLanguage,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Translation failed' }));
    throw new Error(errorData.error || `Translation failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.translatedText;
};

export const translateTextWithDetails = async (
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResult> => {
  const response = await fetch(`${API_BASE_URL}/api/translation/translate-detailed`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      targetLanguage,
      sourceLanguage,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Translation failed' }));
    throw new Error(errorData.error || `Translation failed with status ${response.status}`);
  }

  return await response.json();
};
