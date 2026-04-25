// ─── Gap Map State ─────────────────────────────────────────────────────────
/** Linear progression. Three states only — no exceptions. */
export type ConceptStatus = 'cracked' | 'shaky' | 'solid';

// ─── Concept Seed ───────────────────────────────────────────────────────────
export interface Concept {
  id: string;
  label: string;
  /** One-line description shown in the chip / sidebar */
  description: string;
}

// ─── Dialogue ───────────────────────────────────────────────────────────────
export interface DialogueTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ─── Per-Concept Progress ────────────────────────────────────────────────────
export interface ConceptProgress {
  conceptId: string;
  status: ConceptStatus;
  turns: DialogueTurn[];
  lastUpdated: number;
}

// ─── Session ─────────────────────────────────────────────────────────────────
export interface SessionState {
  sessionId: string;
  /** keyed by Concept.id */
  progress: Record<string, ConceptProgress>;
  activeConceptId: string | null;
}

// ─── Cheat Sheet ─────────────────────────────────────────────────────────────
export interface CheatSheetEntry {
  conceptId: string;
  label: string;
  status: ConceptStatus;
  /** One-line synthesis the AI produced after the Socratic exchange */
  keySynthesis: string;
}

// ─── AI Response ─────────────────────────────────────────────────────────────
export interface SocraticResponse {
  /** The assistant message shown to the user */
  message: string;
  /** Updated status the AI assessed based on the exchange so far */
  updatedStatus: ConceptStatus;
  /** Set to true when the AI confirms the user has reached 'solid' understanding */
  conceptComplete: boolean;
  /** Only populated when conceptComplete is true */
  keySynthesis?: string;
}
