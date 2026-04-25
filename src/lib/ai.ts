import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Gemini API key missing — check .env.local');
}

const genAI = new GoogleGenAI({ apiKey: apiKey ?? '' });

/** Simple text completion. */
export async function ask(prompt: string, model = 'gemini-2.5-flash'): Promise<string> {
  const result = await genAI.models.generateContent({
    model,
    contents: prompt,
  });
  return result.text ?? '';
}

/** Structured JSON output. */
export async function askJSON<T = unknown>(prompt: string, model = 'gemini-2.5-flash'): Promise<T> {
  const result = await genAI.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });
  const text = result.text ?? '{}';
  return JSON.parse(text) as T;
}
