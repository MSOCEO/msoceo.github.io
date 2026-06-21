import { useState } from 'react';
import { useWebLLM } from '../hooks/useWebLLM';
import { MODEL_REGISTRY } from '../lib/models';

export default function ModelSwitcher() {
  const { loadModel, currentModel, loadState } = useWebLLM();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isActive = (id: string) => currentModel?.id === id;
  const isLoading = loadState.status === 'loading' || loadState.status === 'downloading';

  // Featured (first) model gets the hero spot
  const [featured, ...others] = MODEL_REGISTRY;

  return (
    <div className="h-full overflow-y-auto animate-view-enter">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-deep), var(--accent))' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Model Registry
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {MODEL_REGISTRY.length} models · Download once, cached in IndexedDB
              </p>
            </div>
            {currentModel && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
                {currentModel.name} active
              </div>
            )}
          </div>
        </div>

        {/* Featured Model - Hero Card */}
        <div className="mb-4 animate-slide-up">
          <ModelCard
            model={featured}
            isActive={isActive(featured.id)}
            isLoading={isLoading}
            loadState={loadState}
            expanded={expandedId === featured.id}
            onToggleExpand={() => setExpandedId(expandedId === featured.id ? null : featured.id)}
            onLoad={() => loadModel(featured)}
            featured
          />
        </div>

        {/* Grid of remaining models */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {others.map((model, i) => (
            <div key={model.id} className="animate-fade-in-scale" style={{ animationDelay: `${i * 0.06}s` }}>
              <ModelCard
                model={model}
                isActive={isActive(model.id)}
                isLoading={isLoading}
                loadState={loadState}
                expanded={expandedId === model.id}
                onToggleExpand={() => setExpandedId(expandedId === model.id ? null : model.id)}
                onLoad={() => loadModel(model)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModelCard({
  model, isActive, isLoading, loadState, expanded, onToggleExpand, onLoad, featured,
}: {
  model: (typeof MODEL_REGISTRY)[number];
  isActive: boolean;
  isLoading: boolean;
  loadState: { status: string; progress?: number };
  expanded: boolean;
  onToggleExpand: () => void;
  onLoad: () => void;
  featured?: boolean;
}) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300 cursor-pointer group relative overflow-hidden"
      style={{
        background: isActive ? 'var(--accent-bg)' : 'var(--bg-card)',
        border: isActive ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
        boxShadow: isActive ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.borderColor = 'var(--border-default)';
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.borderColor = 'var(--border-subtle)';
      }}
      onClick={onToggleExpand}
    >
      {/* Active indicator bar */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, var(--accent), var(--cyan))' }} />
      )}

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-bold truncate ${featured ? 'text-base' : 'text-sm'}`}
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {model.name}
            </h3>
            {isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0"
                style={{ background: 'var(--success)', color: '#fff' }}>
                LIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{model.size}</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--text-muted)' }} />
            <span>{model.provider}</span>
            <span className="w-1 h-1 rounded-full" style={{ background: 'var(--text-muted)' }} />
            <span>{model.contextLength.toLocaleString()} ctx</span>
          </div>

          {featured && (
            <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {model.description}
            </p>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); onLoad(); }}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-95 shrink-0 ml-3"
          style={{
            background: isActive
              ? 'var(--success-bg)'
              : 'linear-gradient(135deg, var(--accent-deep), var(--accent))',
            color: isActive ? 'var(--success)' : '#fff',
            opacity: isLoading ? 0.5 : 1,
            boxShadow: isActive ? 'none' : '0 0 16px rgba(139, 92, 246, 0.2)',
          }}
        >
          {isLoading && loadState.status === 'downloading'
            ? `${Math.round((loadState as any).progress * 100)}%`
            : isActive ? 'Loaded' : 'Load'}
        </button>
      </div>

      {/* Download progress */}
      {loadState.status === 'downloading' && (
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{
              background: 'linear-gradient(90deg, var(--accent), var(--cyan))',
              width: `${Math.round((loadState as any).progress * 100)}%`,
            }} />
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {model.tags.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="mt-4 pt-4 border-t animate-slide-down" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <DetailItem label="Quantization" value={model.quantization === 'q4' ? '4-bit' : '8-bit'} />
            <DetailItem label="Engine" value={model.engine} />
            <DetailItem label="Context" value={`${model.contextLength.toLocaleString()} tokens`} />
            <DetailItem label="Size" value={model.size} />
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-2.5 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
      <div className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</div>
      <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{value}</div>
    </div>
  );
}
