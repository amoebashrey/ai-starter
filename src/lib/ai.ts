import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let client: GoogleGenAI | null = null;

if (apiKey) {
  try {
    client = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Gemini init failed:', err);
  }
} else {
  console.info('Gemini API key missing — use ?demo=1 for offline demo');
}

export async function askJSON<T>(prompt: string): Promise<T> {
  if (!client) {
    throw new Error('Gemini client not configured. Add VITE_GEMINI_API_KEY to .env.local or use ?demo=1');
  }
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini');
  return JSON.parse(text) as T;
}

export { client };
