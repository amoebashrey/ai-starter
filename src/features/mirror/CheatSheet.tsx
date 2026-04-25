import { useMirrorStore } from './mirrorStore';
import { CONCEPTS } from './concepts';
import type { ConceptStatus } from '../../types/mirror';

interface Props {
  onClose: () => void;
}

const STATUS_LABEL: Record<ConceptStatus, string> = {
  cracked: 'CRACKED',
  shaky: 'SHAKY',
  solid: 'SOLID',
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

const STATUS_NOTE: Record<ConceptStatus, string> = {
  solid: 'Lead with these tomorrow.',
  shaky: 'Quickly review before 10am.',
  cracked: "If asked: it's okay to say you're still learning.",
};

export default function CheatSheet({ onClose }: Props) {
  const { progress } = useMirrorStore();

  const groupedByStatus = (status: ConceptStatus) =>
    CONCEPTS.filter((c) => (progress[c.id]?.status ?? 'cracked') === status);

  const order: ConceptStatus[] = ['solid', 'shaky', 'cracked'];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cheatsheet-title"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28, 25, 23, 0.55)',
        backdropFilter: 'blur(8px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'var(--space-8) var(--space-6)',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg)',
          maxWidth: '1100px',
          width: '100%',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-8)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        }}
      >
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-8)' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)', letterSpacing: '0.08em', margin: 0, marginBottom: 'var(--space-2)' }}>
              TOMORROW'S CHEAT SHEET
            </p>
            <h2 id="cheatsheet-title" style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', margin: 0 }}>
              Here's what you actually know.
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cheat sheet"
            style={{
              background: 'transparent',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2) var(--space-3)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              letterSpacing: '0.05em',
            }}
          >
            ESC ✕
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-6)' }}>
          {order.map((status) => {
            const items = groupedByStatus(status);
            return (
              <section
                key={status}
                aria-label={STATUS_LABEL[status] + ' concepts'}
                style={{
                  background: STATUS_BG[status],
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-5)',
                  minHeight: '280px',
                }}
              >
                <header style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLOR[status] }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', letterSpacing: '0.08em', color: STATUS_COLOR[status], fontWeight: 600 }}>
                      {STATUS_LABEL[status]} ({items.length})
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', margin: 0 }}>
                    {STATUS_NOTE[status]}
                  </p>
                </header>

                {items.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
                    Nothing here yet.
                  </p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {items.map((c) => {
                      const synth = progress[c.id]?.turns?.findLast?.((t) => t.role === 'assistant')?.content;
                      return (
                        <li key={c.id} style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)' }}>
                          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', margin: 0, marginBottom: 'var(--space-1)' }}>
                            {c.label}
                          </p>
                          {status === 'solid' && synth && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic', lineHeight: 1.4, margin: 0 }}>
                              "{synth.slice(0, 140)}{synth.length > 140 ? '…' : ''}"
                            </p>
                          )}
                          {status !== 'solid' && (
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: 0 }}>
                              {c.description}
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </div>

        <footer style={{ marginTop: 'var(--space-8)', paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-border)', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.1rem', color: 'var(--color-text)', margin: 0 }}>
            Walk in tomorrow knowing exactly what you know.
          </p>
        </footer>
      </div>
    </div>
  );
}
