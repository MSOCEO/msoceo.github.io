import { useState } from 'react';
import { useWebLLM } from '../hooks/useWebLLM';
import { MODEL_REGISTRY } from '../lib/models';
import { cn } from '../lib/utils';

export default function ModelSwitcher() {
  const { loadModel, currentModel, loadState } = useWebLLM();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const isActive = (id: string) => currentModel?.id === id;
  const isLoading = loadState.status === 'loading' || loadState.status === 'downloading';

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-lg font-bold tracking-tight animate-slide-up"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Model Registry
          </h2>
          <p className="text-sm mt-1 animate-slide-up stagger-1"
            style={{ color: 'var(--text-secondary)' }}>
            Download once, cached in IndexedDB. Switch anytime — no re-download.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MODEL_REGISTRY.map((model, i) => {
            const active = isActive(model.id);
            const expanded = expandedId === model.id;

            return (
              <div
                key={model.id}
                className={cn('rounded-xl p-4 transition-all duration-200 cursor-pointer animate-fade-in-scale')}
                style={{
                  background: active ? 'var(--accent-bg)' : 'var(--bg-card)',
                  border: active ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                  boxShadow: active ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                  animationDelay: `${i * 0.06}s`,
                }}
                onClick={() => setExpandedId(expanded ? null : model.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate"
                        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                        {model.name}
                      </h3>
                      {active && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                          style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {model.size} · {model.provider}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); loadModel(model); }}
                    disabled={isLoading}
                    className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0 ml-2',
                      active ? 'cursor-default opacity-60' : 'hover:scale-[1.02]')}
                    style={{
                      background: active ? 'var(--success-bg)' : 'var(--accent)',
                      color: active ? 'var(--success)' : '#fff',
                      opacity: isLoading ? 0.5 : 1,
                      fontFamily: 'var(--font-body)',
                    }}
                  >
                    {isLoading && loadState.status === 'downloading'
                      ? `${Math.round((loadState as any).progress * 100)}%`
                      : active ? 'Loaded' : 'Load'}
                  </button>
                </div>

                {loadState.status === 'downloading' && (
                  <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                    <div className="h-full rounded-full animate-shimmer transition-all duration-500"
                      style={{ background: 'var(--accent)', width: `${Math.round((loadState as any).progress * 100)}%` }} />
                  </div>
                )}

                {expanded && (
                  <div className="mt-3 pt-3 border-t animate-slide-up" style={{ borderColor: 'var(--border-subtle)' }}>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {model.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {model.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                          {tag}
                        </span>
                      ))}
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: 'var(--cyan-bg)', color: 'var(--text-cyan)' }}>
                        {model.contextLength.toLocaleString()} ctx
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
