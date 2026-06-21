// ============================================================
// Agent Hub - Model Switcher
// ============================================================

import type { ModelEntry, ModelLoadState } from '../types';
import { MODEL_REGISTRY } from '../lib/models';

interface ModelSwitcherProps {
  loadState: ModelLoadState;
  currentModel: ModelEntry | null;
  onSelect: (model: ModelEntry) => void;
  onUnload: () => void;
}

export function ModelSwitcher({ loadState, currentModel, onSelect, onUnload }: ModelSwitcherProps) {
  const isLoading = loadState.status === 'downloading' || loadState.status === 'loading';

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold">模型管理</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          所有模型在浏览器本地运行，数据不会离开你的设备。
        </p>
      </div>

      {/* Current Model Status */}
      {currentModel && (
        <div className="mb-6 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${
                loadState.status === 'ready' ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'
              }`} />
              <div>
                <p className="font-medium text-sm">{currentModel.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">
                  {currentModel.provider} · {currentModel.size} · {currentModel.quantization.toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={onUnload}
              className="px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--error)] hover:border-[var(--error)]/30 transition-colors"
            >
              卸载
            </button>
          </div>
          {loadState.status === 'downloading' && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-[var(--text-secondary)] mb-1">
                <span>下载模型权重...</span>
                <span>{Math.round(loadState.progress * 100)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-[var(--bg-tertiary)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
                  style={{ width: `${Math.round(loadState.progress * 100)}%` }}
                />
              </div>
            </div>
          )}
          {loadState.status === 'loading' && (
            <p className="text-xs text-[var(--text-secondary)] mt-2">正在加载模型到显存...</p>
          )}
          {loadState.status === 'error' && (
            <p className="text-xs text-[var(--error)] mt-2">{loadState.error}</p>
          )}
        </div>
      )}

      {/* Model List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {MODEL_REGISTRY.map(model => (
          <button
            key={model.id}
            onClick={() => !isLoading && onSelect(model)}
            disabled={isLoading}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentModel?.id === model.id
                ? 'border-[var(--accent)] bg-[var(--accent-bg)]'
                : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--accent)]/40'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-sm">{model.name}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{model.provider}</p>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                {model.size}
              </span>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">{model.description}</p>
            <div className="flex flex-wrap gap-1 mt-2.5">
              {model.tags.map(tag => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                  {tag}
                </span>
              ))}
            </div>
            {currentModel?.id === model.id && (
              <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[var(--accent-light)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                已加载
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Hardware Note */}
      <div className="mt-6 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
        <p className="text-xs text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">硬件要求：</span>
          模型需通过 WebGPU 加速。建议至少 8GB 系统内存用于 7-8B 模型。
          小模型（Gemma 270M、Phi-3 Mini）可在 4GB 内存设备上运行。
          首次加载需下载模型文件（约 2-5GB），后续从本地缓存即时加载。
        </p>
      </div>
    </div>
  );
}
