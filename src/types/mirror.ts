export type ConceptStatus = 'cracked' | 'shaky' | 'solid';

export interface Concept {
  id: string;
  label: string;
  description: string;
  oneLineProvocation: string;
}

export interface DialogueTurn {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ConceptProgress {
  conceptId: string;
  status: ConceptStatus;
  turns: DialogueTurn[];
  lastUpdated: number;
}

export interface SessionState {
  sessionId: string;
  progress: Record<string, ConceptProgress>;
  activeConceptId: string | null;
}

export interface CheatSheetEntry {
  conceptId: string;
  label: string;
  status: ConceptStatus;
  keySynthesis: string;
}

export interface SocraticResponse {
  message: string;
  updatedStatus: ConceptStatus;
  conceptComplete: boolean;
  keySynthesis?: string;
}
