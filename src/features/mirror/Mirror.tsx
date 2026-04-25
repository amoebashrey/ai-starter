import { useEffect, useState, useRef } from 'react';
import { useMirrorStore } from './mirrorStore';
import { CONCEPTS, CONCEPTS_BY_ID } from './concepts';
import { getSocraticResponse } from './aiService';
import CheatSheet from './CheatSheet';
import type { ConceptStatus, DialogueTurn } from '../../types/mirror';

const STATUS_LABEL: Record<ConceptStatus, string> = { cracked: 'CRACKED', shaky: 'SHAKY', solid: 'SOLID' };
const STATUS_COLOR: Record<ConceptStatus, string> = {
  cracked: 'var(--color-cracked)', shaky: 'var(--color-shaky)', solid: 'var(--color-solid)',
};
const STATUS_PILL_BG: Record<ConceptStatus, string> = {
  cracked: 'var(--color-cracked-pill-bg)', shaky: 'var(--color-shaky-pill-bg)', solid: 'var(--color-solid-pill-bg)',
};
const MAX_INPUT_LENGTH = 1000;

export default function Mirror() {
  const { progress, activeConceptId, setActiveConcept, addTurn, updateStatus, persistProgress, initSession } = useMirrorStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => { initSession(); }, [initSession]);
  useEffect(() => {
    const isDemo = new URLSearchParams(window.location.search).get('demo') === '1';
    if (isDemo && !activeConceptId) setActiveConcept('llm-evals');
  }, [activeConceptId, setActiveConcept]);

  useEffect(() => {
    if (transcriptRef.current) transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
  }, [progress, activeConceptId, loading]);

  const activeConcept = activeConceptId ? CONCEPTS_BY_ID[activeConceptId] : null;
  const activeProgress = activeConceptId ? progress[activeConceptId] : null;
  const turns: DialogueTurn[] = activeProgress?.turns ?? [];

  const handleSubmit = async () => {
    if (!activeConcept || !input.trim() || loading) return;
    const trimmed = input.trim().slice(0, MAX_INPUT_LENGTH);
    const userTurn: DialogueTurn = { role: 'user', content: trimmed, timestamp: Date.now() };
    addTurn(activeConcept.id, userTurn);
    setInput(''); setLoading(true); setError(null);
    try {
      const response = await getSocraticResponse(activeConcept.id, trimmed, activeProgress?.turns ?? [], activeProgress?.status ?? 'cracked');
      addTurn(activeConcept.id, { role: 'assistant', content: response.message, timestamp: Date.now() });
      updateStatus(activeConcept.id, response.updatedStatus);
      await persistProgress(activeConcept.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* Top nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: 'var(--space-5) var(--space-10)',
        borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-primary)', letterSpacing: '-0.01em' }}>Probe</div>
        <button type="button" onClick={() => setShowCheatSheet(true)}
          aria-label="Open cheat sheet"
          style={{
            background: 'var(--color-primary)', color: 'var(--color-bg)', border: 'none',
            borderRadius: 'var(--radius-pill)', padding: 'var(--space-2) var(--space-5)',
            fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
          }}>See what I know</button>
      </nav>

      {/* Hero */}
      <header style={{ padding: 'var(--space-12) var(--space-10) var(--space-10)', maxWidth: '1400px', margin: '0 auto' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', margin: 0, marginBottom: 'var(--space-3)' }}>
          9:00 PM — TOMORROW AT 10:00 AM
        </p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.75rem)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, color: 'var(--color-text)' }}>
          What do you actually understand?
        </h1>
      </header>

      {/* Three columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 320px', gap: 'var(--space-8)', maxWidth: '1400px', margin: '0 auto', padding: '0 var(--space-10) var(--space-16)', alignItems: 'start' }}>
        {/* LEFT: concepts */}
        <aside aria-label="Concepts">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {CONCEPTS.map((c) => {
              const isActive = activeConceptId === c.id;
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setActiveConcept(c.id)} aria-pressed={isActive}
                    style={{
                      width: '100%', textAlign: 'left',
                      padding: 'var(--space-4) var(--space-5)',
                      background: isActive ? 'var(--color-primary)' : 'transparent',
                      color: isActive ? 'var(--color-bg)' : 'var(--color-text)',
                      border: '1px solid ' + (isActive ? 'var(--color-primary)' : 'var(--color-border)'),
                      borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      fontSize: '0.95rem', fontWeight: isActive ? 500 : 400,
                      transition: 'all 0.15s',
                    }}>
                    <span>{c.label}</span>
                    {isActive && <span style={{ fontSize: '0.75rem' }}>→</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* CENTER: conversation */}
        <section aria-label="Conversation" style={{
          background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)', minHeight: '600px',
          display: 'flex', flexDirection: 'column',
        }}>
          {!activeConcept ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-12)', textAlign: 'center', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-text)', margin: 0 }}>Pick a concept on the left to begin.</p>
              <p style={{ color: 'var(--color-text-muted)', margin: 0, fontSize: '0.95rem' }}>Type what you think you understand. I will find the gap.</p>
            </div>
          ) : (
            <>
              <div ref={transcriptRef} style={{ flex: 1, padding: 'var(--space-6)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
                {turns.length === 0 && (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', textAlign: 'center', margin: 'auto' }}>
                    Start by explaining {activeConcept.label} in your own words.
                  </p>
                )}
                {turns.map((t, i) =>
                  t.role === 'user' ? (
                    <div key={i} style={{ alignSelf: 'flex-end', maxWidth: '75%' }}>
                      <div style={{ background: 'var(--color-surface-soft)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', lineHeight: 1.5, color: 'var(--color-text)' }}>{t.content}</div>
                    </div>
                  ) : (
                    <div key={i} style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: 'var(--space-4)', maxWidth: '90%' }}>
                      <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--color-text)', margin: 0 }}>{t.content}</p>
                      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-subtle)', letterSpacing: '0.08em', marginTop: 'var(--space-2)', marginBottom: 0 }}>PROBE</p>
                    </div>
                  )
                )}
                {loading && (
                  <div style={{ borderLeft: '2px solid var(--color-primary)', paddingLeft: 'var(--space-4)' }} aria-busy="true" aria-live="polite">
                    <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', margin: 0, fontStyle: 'italic' }}>Thinking…</p>
                  </div>
                )}
                {error && (
                  <div role="alert" style={{ background: 'var(--color-cracked-soft)', color: 'var(--color-cracked)', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                    {error} <button onClick={handleSubmit} style={{ background: 'none', border: 'none', color: 'var(--color-cracked)', textDecoration: 'underline', cursor: 'pointer', fontSize: 'inherit', padding: 0, marginLeft: 'var(--space-2)' }}>Retry</button>
                  </div>
                )}
              </div>

              {/* Input */}
              <div style={{ borderTop: '1px solid var(--color-border)', padding: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
                <textarea value={input} onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT_LENGTH))} onKeyDown={handleKey}
                  placeholder="Explain in your own words..." aria-label="Your response"
                  rows={2}
                  style={{
                    flex: 1, resize: 'none', padding: 'var(--space-3)',
                    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                    fontFamily: 'inherit', fontSize: '0.95rem', lineHeight: 1.5,
                    background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none',
                  }} />
                <button onClick={handleSubmit} disabled={!input.trim() || loading}
                  aria-label="Submit"
                  style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: input.trim() && !loading ? 'var(--color-primary)' : 'var(--color-text-subtle)',
                    color: 'var(--color-bg)', border: 'none',
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                    fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>→</button>
              </div>
            </>
          )}
        </section>

        {/* RIGHT: status map */}
        <aside aria-label="Status map" style={{
          background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)', padding: 'var(--space-6)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 400, margin: 0, marginBottom: 'var(--space-5)', color: 'var(--color-text)' }}>Status Map</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {CONCEPTS.map((c) => {
              const status: ConceptStatus = progress[c.id]?.status ?? 'cracked';
              return (
                <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--color-text)' }}>{c.label}</span>
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.08em',
                    color: STATUS_COLOR[status], background: STATUS_PILL_BG[status],
                    padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600,
                  }}>{STATUS_LABEL[status]}</span>
                </li>
              );
            })}
          </ul>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--color-text-subtle)', marginTop: 'var(--space-6)', textAlign: 'center' }}>
            Powered by Vertex AI · Gemini 2.5 Flash
          </p>
        </aside>
      </div>

      {showCheatSheet && <CheatSheet onClose={() => setShowCheatSheet(false)} />}
    </main>
  );
}
