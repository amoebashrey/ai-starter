import { useEffect, useState, useRef } from 'react';
import { useMirrorStore } from './mirrorStore';
import { CONCEPTS, CONCEPTS_BY_ID } from './concepts';
import { getSocraticResponse } from './aiService';
import CheatSheet from './CheatSheet';
import type { ConceptStatus, DialogueTurn } from '../../types/mirror';

const STATUS_LABEL: Record<ConceptStatus, string> = {
  cracked: 'Cracked',
  shaky: 'Shaky',
  solid: 'Solid',
};

const STATUS_COLOR: Record<ConceptStatus, string> = {
  cracked: 'var(--color-cracked)',
  shaky: 'var(--color-shaky)',
  solid: 'var(--color-solid)',
};

const STATUS_BG: Record<ConceptStatus, string> = {
  cracked: 'var(--color-cracked-soft)',
  shaky: 'var(--color-shaky-soft)',
  solid: 'var(--color-solid-soft)',
};

export default function Mirror() {
  const {
    progress,
    activeConceptId,
    initSession,
    setActiveConcept,
    addTurn,
    updateStatus,
    persistProgress,
  } = useMirrorStore();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initSession();
    if (new URLSearchParams(window.location.search).get('demo') === '1') {
      setTimeout(() => setActiveConcept('llm-evals'), 100);
    }
  }, [initSession, setActiveConcept]);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [progress, activeConceptId]);

  const activeConcept = activeConceptId ? CONCEPTS_BY_ID[activeConceptId] : null;
  const activeProgress = activeConceptId ? progress[activeConceptId] : null;
  const turns: DialogueTurn[] = activeProgress?.turns ?? [];

  const handleSubmit = async () => {
    if (!input.trim() || !activeConcept || loading) return;
    const userTurn: DialogueTurn = { role: 'user', content: input.trim(), timestamp: Date.now() };
    addTurn(activeConcept.id, userTurn);
    const userInput = input.trim();
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const response = await getSocraticResponse(activeConcept.id, userInput, activeProgress?.turns ?? [], activeProgress?.status ?? 'cracked');
      addTurn(activeConcept.id, { role: 'assistant', content: response.message, timestamp: Date.now() });
      updateStatus(activeConcept.id, response.updatedStatus);
      await persistProgress(activeConcept.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
  };

  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', padding: 'var(--space-8)' }} aria-label="Mayas Mirror">
      <header style={{ marginBottom: 'var(--space-12)', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: 'var(--space-2)' }}>
          9:00 PM — TOMORROW AT 10:00 AM
        </p>
        <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-display)', fontWeight: 400, letterSpacing: '-0.02em' }}>
          What do you actually understand?
        </h1>
              <button
          type="button"
          onClick={() => setShowCheatSheet(true)}
          aria-label="Open cheat sheet"
          style={{
            position: 'absolute',
            top: 'var(--space-6)',
            right: 'var(--space-8)',
            background: 'var(--color-text)',
            color: 'var(--color-bg)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-2) var(--space-4)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.05em',
            cursor: 'pointer',
          }}
        >
          SEE WHAT I KNOW →
        </button>
      </header>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 280px', gap: 'var(--space-8)', maxWidth: '1400px', margin: '0 auto', alignItems: 'start' }}>
        <aside aria-label="Concept picker">
          <h2 style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>CONCEPTS</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {CONCEPTS.map((c) => {
              const status = progress[c.id]?.status ?? 'cracked';
              const isActive = activeConceptId === c.id;
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setActiveConcept(c.id)} aria-pressed={isActive}
                    style={{ width: '100%', textAlign: 'left', padding: 'var(--space-3)', background: isActive ? 'var(--color-surface)' : 'transparent', border: '1px solid ' + (isActive ? 'var(--color-text)' : 'var(--color-border)'), borderRadius: 'var(--radius-md)', cursor: 'pointer', fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                      <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{c.label}</span>
                      <span aria-label={c.label + ': ' + STATUS_LABEL[status]} style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: STATUS_BG[status], color: STATUS_COLOR[status], whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{STATUS_LABEL[status]}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 'var(--space-1)', fontStyle: 'italic', lineHeight: 1.4 }}>{c.oneLineProvocation}</p>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
        <section aria-label="Socratic dialogue" style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', padding: 'var(--space-6)', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          {!activeConcept ? (
            <div style={{ flex: 1, display: 'grid', placeItems: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', textAlign: 'center', padding: 'var(--space-8)' }}>
              <div>
                <p style={{ fontSize: '1.1rem', marginBottom: 'var(--space-2)' }}>Pick a concept on the left to begin.</p>
                <p style={{ fontSize: '0.9rem' }}>Type what you think you understand. I will find the gap.</p>
              </div>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 'var(--space-6)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                <h3 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-1)' }}>{activeConcept.label}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{activeConcept.description}</p>
              </div>
              <div ref={transcriptRef} aria-live="polite" aria-busy={loading} style={{ flex: 1, overflowY: 'auto', marginBottom: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxHeight: '400px' }}>
                {turns.length === 0 && (<p style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.95rem' }}>Type your current understanding below. Do not overthink it — first instinct.</p>)}
                {turns.map((turn, i) => (
                  <div key={i} style={{ padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', background: turn.role === 'user' ? 'var(--color-bg)' : 'var(--color-accent-soft)', borderLeft: turn.role === 'assistant' ? '3px solid var(--color-accent)' : 'none' }}>
                    <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-1)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{turn.role === 'user' ? 'You' : 'Mirror'}</p>
                    <p style={{ fontSize: '1rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{turn.content}</p>
                  </div>
                ))}
                {loading && (<div style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.95rem' }}>Thinking...</div>)}
                {error && (<div role="alert" style={{ padding: 'var(--space-3)', background: 'var(--color-cracked-soft)', borderRadius: 'var(--radius-md)', color: 'var(--color-cracked)', fontSize: '0.9rem' }}>{error} <button onClick={handleSubmit} style={{ marginLeft: 'var(--space-2)', textDecoration: 'underline', color: 'inherit', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button></div>)}
              </div>
              <div>
                <label htmlFor="user-input" style={{ display: 'block', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your turn</label>
                <textarea id="user-input" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={loading} placeholder="Explain in your own words. Cmd+Enter to submit." rows={3}
                  style={{ width: '100%', padding: 'var(--space-3)', fontSize: '1rem', fontFamily: 'var(--font-body)', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', resize: 'vertical', color: 'var(--color-text)', outline: 'none' }} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
                  <button type="button" onClick={handleSubmit} disabled={loading || !input.trim()}
                    style={{ padding: 'var(--space-2) var(--space-6)', background: loading || !input.trim() ? 'var(--color-border)' : 'var(--color-accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-full)', fontSize: '0.95rem', fontWeight: 500, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Thinking...' : 'Submit'}
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
        <aside aria-label="Gap map">
          <h2 style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', letterSpacing: '0.05em', marginBottom: 'var(--space-4)' }}>GAP MAP</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {CONCEPTS.map((c) => {
              const status = progress[c.id]?.status ?? 'cracked';
              return (
                <li key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                  <span style={{ fontSize: '0.85rem' }}>{c.label}</span>
                  <span aria-label={c.label + ': ' + STATUS_LABEL[status]} style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLOR[status], flexShrink: 0 }} />
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
      {showCheatSheet && <CheatSheet onClose={() => setShowCheatSheet(false)} />}
    </main>
  );
}
