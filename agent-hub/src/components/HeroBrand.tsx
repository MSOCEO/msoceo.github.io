interface HeroBrandProps {
  onDismiss: () => void;
}

export default function HeroBrand({ onDismiss }: HeroBrandProps) {
  return (
    <div className="relative overflow-hidden border-b animate-slide-up"
      style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-subtle)' }}>
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, var(--accent), var(--cyan), transparent)' }} />

      <div className="max-w-2xl mx-auto px-6 py-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              <span style={{ color: 'var(--accent-light)' }}>Local</span> Intelligence.
              <br />
              <span style={{ color: 'var(--text-cyan)' }}>Zero</span> Leakage.
            </h1>
            <p className="text-sm mt-1.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Every model runs entirely in your browser via WebGPU.
              No server. No API keys. Nothing leaves your machine.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <Badge label="WebGPU" />
              <Badge label="IndexedDB Cache" />
              <Badge label="Apache 2.0" />
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-colors hover:bg-[var(--bg-tertiary)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{
        background: 'var(--accent-bg)',
        color: 'var(--accent-light)',
        fontFamily: 'var(--font-body)',
      }}>
      {label}
    </span>
  );
}
