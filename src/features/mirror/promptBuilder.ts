import type { Concept, DialogueTurn, ConceptStatus, SocraticResponse } from '../../types/mirror';

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a strict but fair Socratic coach preparing an aspiring PM for an AI PM interview tomorrow.

Your ONLY job: find the gaps in the user's mental model and surface them through ONE precise question at a time.

Rules you never break:
1. Never lecture or explain unprompted. Ask ONE question — no more.
2. If the user's understanding is mostly correct, confirm it with ONE sharpening sentence, then update their status.
3. If there's a gap, ask ONE question that forces them to find it themselves. Do not tell them the answer.
4. Speak like a sharp senior PM — direct, no fluff, no corporate preamble.
5. Never ask two questions in one turn.

You must always respond with valid JSON matching this schema exactly:
{
  "message": "<your Socratic question or confirmation — plain text, no markdown>",
  "updatedStatus": "<cracked | shaky | solid>",
  "conceptComplete": <true | false>,
  "keySynthesis": "<only when conceptComplete is true: one sentence that crystallises what they now understand>"
}

Status rules:
- cracked: user shows fundamental misunderstanding or conflation
- shaky: user has partial understanding but a clear gap remains
- solid: user can correctly articulate the concept AND its PM implication
- Once solid, set conceptComplete to true and provide keySynthesis.`;

// ─── Prompt Builder ───────────────────────────────────────────────────────────

export interface PromptInput {
  concept: Concept;
  userMessage: string;
  history: DialogueTurn[];
  currentStatus: ConceptStatus;
}

/**
 * Builds the full contents array for a Gemini multi-turn call.
 * Pure function — no side effects, fully testable.
 */
export function buildSocraticPrompt(input: PromptInput): {
  systemInstruction: string;
  history: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }>;
  userMessage: string;
} {
  const { concept, userMessage, history, currentStatus } = input;

  const contextPrefix =
    `Concept being stress-tested: "${concept.label}" — ${concept.description}\n` +
    `Current status: ${currentStatus}\n\n`;

  // Map dialogue history to Gemini's content format
  // First user message gets the context prefix prepended
  const geminiHistory = history.map((turn, idx) => ({
    role: turn.role === 'user' ? ('user' as const) : ('model' as const),
    parts: [
      {
        text: idx === 0 && turn.role === 'user' ? contextPrefix + turn.content : turn.content,
      },
    ],
  }));

  // The current user message — prepend context only if this is the first turn
  const isFirstTurn = history.length === 0;
  const currentUserText = isFirstTurn ? contextPrefix + userMessage : userMessage;

  return {
    systemInstruction: SYSTEM_PROMPT,
    history: geminiHistory,
    userMessage: currentUserText,
  };
}

// ─── Response Parser ──────────────────────────────────────────────────────────

/**
 * Parses and validates the JSON response from Gemini.
 * Falls back gracefully if the model breaks schema.
 */
export function parseSocraticResponse(raw: string): SocraticResponse {
  const VALID_STATUSES: ConceptStatus[] = ['cracked', 'shaky', 'solid'];

  try {
    // Strip markdown code fences if model wraps in them
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned) as Record<string, unknown>;

    const message = typeof parsed.message === 'string' ? parsed.message : 'Can you say more about that?';
    const updatedStatus: ConceptStatus = VALID_STATUSES.includes(parsed.updatedStatus as ConceptStatus)
      ? (parsed.updatedStatus as ConceptStatus)
      : 'cracked';
    const conceptComplete = parsed.conceptComplete === true;
    const keySynthesis =
      conceptComplete && typeof parsed.keySynthesis === 'string' ? parsed.keySynthesis : undefined;

    return { message, updatedStatus, conceptComplete, keySynthesis };
  } catch {
    // Graceful fallback — never crash the UI
    return {
      message: "I didn't quite get that. Can you rephrase your understanding?",
      updatedStatus: 'cracked',
      conceptComplete: false,
    };
  }
}
