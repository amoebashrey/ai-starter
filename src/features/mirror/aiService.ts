import { GoogleGenAI } from '@google/genai';
import { db } from '../../lib/firebase';
import type { Concept, DialogueTurn, SocraticResponse } from '../../types/mirror';
import { buildSocraticPrompt, parseSocraticResponse } from './promptBuilder';
import type { ConceptStatus } from '../../types/mirror';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
const genAI = new GoogleGenAI({ apiKey });

// Silence unused import lint — db is imported for future Firestore triggers
void db;

// ─── Demo mode seed ───────────────────────────────────────────────────────────
// ?demo=1 returns a deterministic response without hitting the network.

const DEMO_RESPONSES: Record<number, SocraticResponse> = {
  0: {
    message:
      "Got it. Quick question — if you A/B test two prompts and Prompt A gets higher user ratings but Prompt B has lower hallucination rate on a holdout set, which one ships?",
    updatedStatus: 'cracked',
    conceptComplete: false,
  },
  1: {
    message:
      "Closer. But which metric are you optimising for — preference or correctness? And who decides that in your org?",
    updatedStatus: 'shaky',
    conceptComplete: false,
  },
  2: {
    message:
      "Right — user feedback measures preference, offline evals measure correctness. Real teams use both and the PM decides the trade-off based on risk tolerance.",
    updatedStatus: 'solid',
    conceptComplete: true,
    keySynthesis:
      "LLM evals are not one thing — user feedback and offline accuracy evals measure different things. A PM owns the decision of which to prioritise per feature risk.",
  },
};

function isDemoMode(): boolean {
  return new URLSearchParams(window.location.search).get('demo') === '1';
}

// ─── Core AI call ─────────────────────────────────────────────────────────────

export async function getSocraticResponse(
  concept: Concept,
  userMessage: string,
  history: DialogueTurn[],
  currentStatus: ConceptStatus,
): Promise<SocraticResponse> {
  // Validate input before touching any external service
  const trimmed = userMessage.trim();
  if (!trimmed) throw new Error('User message cannot be empty');
  if (trimmed.length > 2000) throw new Error('Message too long (max 2000 chars)');

  // Demo mode — guaranteed working scenario without network
  if (isDemoMode()) {
    const turnIndex = Math.min(history.length, 2);
    await new Promise((r) => setTimeout(r, 800)); // simulate latency
    return DEMO_RESPONSES[turnIndex];
  }

  const { systemInstruction, history: geminiHistory, userMessage: currentUserMessage } =
    buildSocraticPrompt({ concept, userMessage: trimmed, history, currentStatus });

  const chat = genAI.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
    },
    history: geminiHistory,
  });

  const result = await chat.sendMessage({ message: currentUserMessage });
  const raw = result.text ?? '{}';
  return parseSocraticResponse(raw);
}
