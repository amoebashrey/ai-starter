import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { ConceptProgress, SessionState } from '../../types/mirror';

export async function loadSession(sessionId: string): Promise<SessionState | null> {
  if (!db) return null;
  try {
    const ref = doc(db, 'sessions', sessionId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as SessionState;
  } catch (err) {
    console.warn('Firestore load failed (offline?)', err);
    return null;
  }
}

export async function saveProgress(
  sessionId: string,
  conceptId: string,
  progress: ConceptProgress
): Promise<void> {
  if (!db) return;
  try {
    const ref = doc(db, 'sessions', sessionId);
    await setDoc(
      ref,
      { sessionId, progress: { [conceptId]: progress } },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore save failed (offline?)', err);
  }
}
