import { useMirrorStore } from './mirrorStore';
import { CONCEPTS } from './concepts';
import type { ConceptStatus } from '../../types/mirror';

interface Props { onClose: () => void; }

const COLUMN_META: Record<ConceptStatus, { label: string; pillBg: string; pillColor: string; helper: string; mastery: string }> = {
  solid: {
    label: 'SOLID',
    pillBg: 'var(--color-solid-pill-bg)',
    pillColor: 'var(--color-solid)',
    helper: 'Lead with these tomorrow.',
    mastery: 'MASTERY LEVEL: HIGH',
  },
  shaky: {
    label: 'SHAKY',
    pillBg: 'var(--color-shaky-pill-bg)',
    pillColor: 'var(--color-shaky)',
    helper: 'Quickly review before 10am.',
    mastery: 'REVIEW RECOMMENDED',
  },
  cracked: {
    label: 'CRACKED',
    pillBg: 'var(--color-cracked-pill-bg)',
    pillColor: 'var(--color-cracked)',
    helper: "It's okay to say you're still learning.",
    mastery: 'STILL LEARNING',
  },
};

export default function CheatSheet({ onClose }: Props) {
  const { progress } = useMirrorStore();

  const grouped: Record<ConceptStatus, typeof CONCEPTS> = { solid: [], shaky: [], cracked: [] };
  CONCEPTS.forEach((c) => {
    const status = progress[c.id]?.status ?? 'cracked';
    grouped[status].push(c);
  });

  return (
    <div role="dialog" aria-modal="true" aria-label="Cheat sheet" onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10, 20, 41, 0.5)',
        zIndex: 100, overflowY: 'auto',
      }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg)', minHeight: '100vh',
          maxWidth: '1400px', margin: '0 auto', padding: 'var(--space-10)',
        }}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-10)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--color-primary)' }}>Probe</div>
          <button onClick={onClose} aria-label="Close cheat sheet"
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', fontSize: '1.5rem', cursor: 'pointer', padding: 'var(--space-2)' }}>×</button>
        </div>

        {/* Hero */}
        <header style={{ marginBottom: 'var(--space-10)' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-text-muted)', letterSpacing: '0.1em', margin: 0, marginBottom: 'var(--space-3)' }}>
            TOMORROW'S CHEAT SHEET
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0, color: 'var(--color-text)' }}>
            Here's what you actually know.
          </h1>
        </header>

        {/* 3 columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
          {(['solid', 'shaky', 'cracked'] as ConceptStatus[]).map((status) => {
            const meta = COLUMN_META[status];
            const items = grouped[status];
            return (
              <div key={status}>
                <div style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.1em',
                  color: meta.pillColor, background: meta.pillBg,
                  padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 600,
                  marginBottom: 'var(--space-3)',
                }}>{meta.label}</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0, marginBottom: 'var(--space-5)' }}>{meta.helper}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {items.length === 0 && (
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)', fontStyle: 'italic', margin: 0 }}>None yet.</p>
                  )}
                  {items.map((c) => {
                    const synth = null;
                    return (
                      <article key={c.id} style={{
                        background: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-5)',
                      }}>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.15rem', fontWeight: 400, margin: 0, marginBottom: synth ? 'var(--space-3)' : 'var(--space-4)', color: 'var(--color-text)' }}>{c.label}</h3>
                        {synth && (
                          <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--color-text-muted)', margin: 0, marginBottom: 'var(--space-4)' }}>{synth}</p>
                        )}
                        {!synth && status !== 'solid' && (
                          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)', fontStyle: 'italic', margin: 0, marginBottom: 'var(--space-4)' }}>{c.description}</p>
                        )}
                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--color-text-subtle)', letterSpacing: '0.08em', margin: 0, fontWeight: 500 }}>{meta.mastery}</p>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-6)', textAlign: 'left' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Walk in tomorrow knowing exactly what you know.
          </p>
        </footer>
      </div>
    </div>
  );
}
