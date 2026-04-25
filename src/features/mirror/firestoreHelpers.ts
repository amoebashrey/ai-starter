import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { ConceptProgress, SessionState } from '../../types/mirror';

// ─── Firestore schema ─────────────────────────────────────────────────────────
//   sessions/{sessionId}
//     progress: Record<conceptId, ConceptProgress>
//     updatedAt: serverTimestamp
//
// TODO (demo): Firestore rules allow read/write without auth for hackathon.
//   In production, lock to authenticated user sessions.

const sessionsCol = 'sessions';

// ─── Load ─────────────────────────────────────────────────────────────────────

export async function loadSession(
  sessionId: string,
): Promise<Pick<SessionState, 'progress'> | null> {
  const ref = doc(db, sessionsCol, sessionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const data = snap.data() as { progress?: Record<string, ConceptProgress> };
  return { progress: data.progress ?? {} };
}

// ─── Save (upsert single concept) ────────────────────────────────────────────

export async function saveProgress(
  sessionId: string,
  conceptId: string,
  progress: ConceptProgress,
): Promise<void> {
  const ref = doc(db, sessionsCol, sessionId);

  // Merge so we don't overwrite other concepts in the same write
  await setDoc(
    ref,
    {
      [`progress.${conceptId}`]: progress,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
