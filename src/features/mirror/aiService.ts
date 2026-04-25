import type { SocraticResponse, ConceptStatus, DialogueTurn } from '../../types/mirror';
import { buildSocraticPrompt, parseSocraticResponse } from './promptBuilder';
import { CONCEPTS_BY_ID } from './concepts';

const apiKey = import.meta.env.VITE_VERTEX_API_KEY;
const project = import.meta.env.VITE_VERTEX_PROJECT;
const location = import.meta.env.VITE_VERTEX_LOCATION || 'global';

const isDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('demo') === '1';
};

const DEMO_ARC: Record<number, SocraticResponse> = {
  0: {
    message: "You said 'user testing for prompts.' Quick probe: when you A/B two prompts and users prefer A, but offline accuracy says B is better — which do you ship, and why?",
    updatedStatus: 'shaky',
    conceptComplete: false,
  },
  1: {
    message: "Good — you're seeing the gap. So if preference and accuracy disagree, what does that tell you about what 'eval' actually means for an LLM product?",
    updatedStatus: 'shaky',
    conceptComplete: false,
  },
  2: {
    message: "Exactly. LLM evals aren't one number — they're a portfolio: offline benchmarks, human preference, and production telemetry. You'd weight them by what the user actually does with the output. You've got this.",
    updatedStatus: 'solid',
    conceptComplete: true,
    keySynthesis: 'LLM evals are a portfolio: offline benchmarks + human preference + production telemetry, weighted by user task.',
  },
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function callVertex(
  systemInstruction: string,
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>,
  userMessage: string
): Promise<string> {
  if (!apiKey || !project) {
    throw new Error('Vertex not configured. Check VITE_VERTEX_API_KEY and VITE_VERTEX_PROJECT in .env.local');
  }
  const url = `https://aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  const contents = [
    ...history,
    { role: 'user' as const, parts: [{ text: userMessage }] },
  ];
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents,
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7 },
    }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Vertex API error ${res.status}: ${errText}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Vertex');
  return text;
}

export async function getSocraticResponse(
  conceptId: string,
  userMessage: string,
  history: DialogueTurn[],
  currentStatus: ConceptStatus
): Promise<SocraticResponse> {
  if (isDemoMode()) {
    await sleep(800);
    const turnIndex = history.filter(t => t.role === 'user').length;
    return DEMO_ARC[Math.min(turnIndex, 2)] ?? DEMO_ARC[2];
  }

  const concept = CONCEPTS_BY_ID[conceptId];
  if (!concept) throw new Error('Unknown concept: ' + conceptId);

  const built = buildSocraticPrompt({ concept, userMessage, history, currentStatus });
  const raw = await callVertex(built.systemInstruction, built.history, built.userMessage);
  return parseSocraticResponse(raw);
}
