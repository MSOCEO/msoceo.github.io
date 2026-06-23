import { useState, useEffect } from 'react';
import { useWebLLM } from '../hooks/useWebLLM';
import { MODEL_REGISTRY } from '../lib/models';
import { EXTERNAL_MODELS } from '../lib/external-models';
import { useToolRegistry } from '../hooks/useToolRegistry';
import type { ExternalModel, ModelCategory } from '../types';

const CAT_TABS: { key: ModelCategory; label: string; icon: string }[] = [
  { key: 'text',  label: '文字 LLM', icon: '💬' },
  { key: 'image', label: '图像生成', icon: '🎨' },
  { key: 'ui',    label: 'UI 生成',  icon: '🪄' },
  { key: 'code',  label: '代码',     icon: '💻' },
  { key: 'voice', label: '语音',     icon: '🎙️' },
  { key: 'video', label: '视频',     icon: '🎬' },
];

export default function ModelSwitcher() {
  const { loadModel, currentModel, loadState } = useWebLLM();
  const { isInstalled, getTool } = useToolRegistry();
  const [tab, setTab] = useState<ModelCategory>('text');

  const isActive = (id: string) => currentModel?.id === id;
  const isLoading = loadState.status === 'loading' || loadState.status === 'downloading';

  const textModels = MODEL_REGISTRY;
  const externalModels = EXTERNAL_MODELS.filter(m => m.category === tab);

  return (
    <div className="h-full overflow-y-auto animate-view-enter">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-deep), var(--accent))' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Model Registry
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {MODEL_REGISTRY.length + EXTERNAL_MODELS.length} 个模型 · 覆盖 6 大品类
              </p>
            </div>
            {currentModel && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--success)' }} />
                {currentModel.name} active
              </div>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {CAT_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: tab === t.key ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                color: tab === t.key ? 'var(--accent-light)' : 'var(--text-muted)',
                border: tab === t.key ? '1px solid var(--border-accent)' : '1px solid transparent',
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Text Models (WebLLM — downloadable) */}
        {tab === 'text' && (
          <>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              浏览器本地运行 · WebGPU 加速 · 下载后离线可用 · IndexedDB 缓存
            </p>
            {textModels.map((model, i) => (
              <div key={model.id} className="animate-fade-in-scale mb-3" style={{ animationDelay: `${i * 0.04}s` }}>
                <TextModelCard
                  model={model}
                  isActive={isActive(model.id)}
                  isLoading={isLoading}
                  loadState={loadState}
                  onLoad={() => loadModel(model)}
                />
              </div>
            ))}
          </>
        )}

        {/* External Models (require installed tool) */}
        {tab !== 'text' && (
          <>
            <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              这些模型通过已安装的工具运行 · 先在 <span style={{ color: 'var(--accent-light)' }}>App Store</span> 安装对应工具
            </p>
            {externalModels.length === 0 ? (
              <div className="py-16 text-center animate-fade-in">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--bg-tertiary)' }}>
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>该品类暂无模型</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {externalModels.map((model, i) => (
                  <ExternalModelCard key={model.id} model={model} isInstalled={isInstalled} getTool={getTool} delay={i} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TextModelCard({
  model, isActive, isLoading, loadState, onLoad,
}: {
  model: (typeof MODEL_REGISTRY)[number];
  isActive: boolean;
  isLoading: boolean;
  loadState: { status: string; progress?: number };
  onLoad: () => void;
}) {
  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300"
      style={{
        background: isActive ? 'var(--accent-bg)' : 'var(--bg-card)',
        border: isActive ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
        boxShadow: isActive ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
      }}
    >
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, var(--accent), var(--cyan))' }} />
      )}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold truncate" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {model.name}
            </h3>
            {isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'var(--success)', color: '#fff' }}>LIVE</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>{model.size}</span><span>·</span><span>{model.provider}</span><span>·</span><span>{model.contextLength.toLocaleString()} ctx</span>
          </div>
          <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{model.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {model.tags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{tag}</span>
            ))}
          </div>
        </div>
        <button
          onClick={onLoad}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 shrink-0 ml-3"
          style={{
            background: isActive ? 'var(--success-bg)' : 'linear-gradient(135deg, var(--accent-deep), var(--accent))',
            color: isActive ? 'var(--success)' : '#fff',
            opacity: isLoading ? 0.5 : 1,
          }}
        >
          {isLoading && loadState.status === 'downloading'
            ? `${Math.round((loadState as any).progress * 100)}%`
            : isActive ? 'Loaded' : 'Load'}
        </button>
      </div>
      {loadState.status === 'downloading' && (
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="h-full rounded-full transition-all" style={{
            background: 'linear-gradient(90deg, var(--accent), var(--cyan))',
            width: `${Math.round((loadState as any).progress * 100)}%`,
          }} />
        </div>
      )}
    </div>
  );
}

function ExternalModelCard({
  model, isInstalled, getTool, delay,
}: {
  model: ExternalModel;
  isInstalled: (id: string) => boolean;
  getTool: (id: string) => any;
  delay: number;
}) {
  const readyTools = model.requires.filter(t => isInstalled(t));
  const needsInstall = model.requires.filter(t => !isInstalled(t));
  const ready = readyTools.length > 0;

  return (
    <div
      className="rounded-2xl p-4 transition-all duration-300 animate-fade-in-scale"
      style={{
        background: ready ? 'var(--bg-card)' : 'var(--bg-primary)',
        border: ready ? '1px solid var(--border-subtle)' : '1px solid var(--border-subtle)',
        boxShadow: ready ? 'var(--shadow-sm)' : 'none',
        opacity: ready ? 1 : 0.55,
        animationDelay: `${delay * 0.04}s`,
      }}
    >
      <div className="flex items-start gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
          style={{ background: ready ? 'var(--accent-bg)' : 'var(--bg-tertiary)' }}>
          {model.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{model.name}</h3>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {model.provider}{model.size ? ` · ${model.size}` : ''}
          </p>
        </div>
      </div>
      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{model.description}</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {model.tags.map(tag => (
          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{tag}</span>
        ))}
      </div>
      <div className="space-y-1">
        {readyTools.map(tid => {
          const t = getTool(tid);
          return (
            <div key={tid} className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--success)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
              {t?.name || tid} 已安装
            </div>
          );
        })}
        {needsInstall.map(tid => {
          const t = getTool(tid);
          return (
            <div key={tid} className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--text-muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
              需要安装 {t?.name || tid}
            </div>
          );
        })}
      </div>
    </div>
  );
}
