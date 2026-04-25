import { create } from 'zustand';
import type { ConceptProgress, ConceptStatus, DialogueTurn, SessionState } from '../../types/mirror';
import { saveProgress, loadSession } from './firestoreHelpers';

// ─── Derived helpers ──────────────────────────────────────────────────────────

function makeEmptyProgress(conceptId: string): ConceptProgress {
  return {
    conceptId,
    status: 'cracked',
    turns: [],
    lastUpdated: Date.now(),
  };
}

// ─── Store shape ──────────────────────────────────────────────────────────────

interface MirrorStore extends SessionState {
  isLoading: boolean;
  error: string | null;

  // Actions
  initSession: () => Promise<void>;
  setActiveConcept: (conceptId: string) => void;
  addTurn: (conceptId: string, turn: DialogueTurn) => void;
  updateStatus: (conceptId: string, status: ConceptStatus) => void;
  persistProgress: (conceptId: string) => Promise<void>;
}

// ─── Session ID — persisted in localStorage, no auth required ─────────────────

function getOrCreateSessionId(): string {
  const key = 'maya-session-id';
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useMirrorStore = create<MirrorStore>((set, get) => ({
  sessionId: '',
  progress: {},
  activeConceptId: null,
  isLoading: false,
  error: null,

  initSession: async () => {
    const sessionId = getOrCreateSessionId();
    set({ isLoading: true, error: null });

    try {
      const persisted = await loadSession(sessionId);
      set({
        sessionId,
        progress: persisted?.progress ?? {},
        activeConceptId: null,
        isLoading: false,
      });
    } catch {
      // Firestore unavailable — start fresh, don't block the user
      set({ sessionId, progress: {}, isLoading: false });
    }
  },

  setActiveConcept: (conceptId) => {
    const { progress } = get();
    if (!progress[conceptId]) {
      set((state) => ({
        activeConceptId: conceptId,
        progress: {
          ...state.progress,
          [conceptId]: makeEmptyProgress(conceptId),
        },
      }));
    } else {
      set({ activeConceptId: conceptId });
    }
  },

  addTurn: (conceptId, turn) => {
    set((state) => {
      const existing = state.progress[conceptId] ?? makeEmptyProgress(conceptId);
      return {
        progress: {
          ...state.progress,
          [conceptId]: {
            ...existing,
            turns: [...existing.turns, turn],
            lastUpdated: Date.now(),
          },
        },
      };
    });
  },

  updateStatus: (conceptId, status) => {
    set((state) => {
      const existing = state.progress[conceptId] ?? makeEmptyProgress(conceptId);
      return {
        progress: {
          ...state.progress,
          [conceptId]: { ...existing, status, lastUpdated: Date.now() },
        },
      };
    });
  },

  persistProgress: async (conceptId) => {
    const { sessionId, progress } = get();
    const conceptProgress = progress[conceptId];
    if (!conceptProgress) return;

    try {
      await saveProgress(sessionId, conceptId, conceptProgress);
    } catch {
      // Silent fail — offline resilience. User data is still in memory.
    }
  },
}));
