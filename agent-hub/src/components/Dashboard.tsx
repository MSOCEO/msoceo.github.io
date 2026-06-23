import { useEffect, useState } from 'react';
import { useToolRegistry } from '../hooks/useToolRegistry';
import { TOOL_CATALOG, CATEGORY_INFO } from '../lib/tools';
import { MODEL_REGISTRY } from '../lib/models';
import { EXTERNAL_MODELS } from '../lib/external-models';

interface DashboardProps {
  currentModel: string | null;
  webgpuSupported: boolean;
  sessionsCount: number;
  onNavigate: (view: 'chat' | 'models' | 'skills' | 'store') => void;
}

export default function Dashboard({
  currentModel, webgpuSupported, sessionsCount, onNavigate,
}: DashboardProps) {
  const { installed, getTool, getUrl, togglePin, uninstall } = useToolRegistry();
  const [storageEstimate, setStorageEstimate] = useState<{ usage: number; quota: number } | null>(null);

  useEffect(() => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      navigator.storage.estimate().then(est => {
        setStorageEstimate({ usage: est.usage || 0, quota: est.quota || 0 });
      });
    }
  }, []);

  const totalModels = MODEL_REGISTRY.length + EXTERNAL_MODELS.length;
  const pinned = installed.filter(t => t.isPinned);

  return (
    <div className="h-full overflow-y-auto animate-view-enter">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* ===== System Status Row ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatusCard
            icon={<CpuIcon />}
            label="WebGPU"
            value={webgpuSupported ? '就绪' : '不可用'}
            color={webgpuSupported ? '#10B981' : '#64748B'}
            subtitle={webgpuSupported ? '硬件加速可用' : '浏览器不支持'}
          />
          <StatusCard
            icon={<ModelIcon />}
            label="当前模型"
            value={currentModel || '未加载'}
            color={currentModel ? '#8B5CF6' : '#64748B'}
            subtitle={currentModel ? '已缓存到本地' : '前往模型市场加载'}
            onClick={currentModel ? undefined : () => onNavigate('models')}
          />
          <StatusCard
            icon={<StorageIcon />}
            label="本地存储"
            value={storageEstimate ? formatBytes(storageEstimate.usage) : '—'}
            color="#06B6D4"
            subtitle={storageEstimate ? `可用 ${formatBytes(storageEstimate.quota)}` : '计算中...'}
          />
          <StatusCard
            icon={<ToolsIcon />}
            label="已安装工具"
            value={`${installed.length} / ${TOOL_CATALOG.length}`}
            color={installed.length > 0 ? '#F59E0B' : '#64748B'}
            subtitle={installed.length > 0 ? `${pinned.length} 个已置顶` : '前往商店安装'}
            onClick={installed.length === 0 ? () => onNavigate('store') : undefined}
          />
        </div>

        {/* ===== Two-column layout ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Quick Start + Installed Tools */}
          <div className="space-y-6">
            {/* Quick Start */}
            <div className="rounded-2xl p-5"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
              }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                <span className="text-base">🚀</span> 快速开始
              </h3>
              <div className="space-y-3">
                <StepCard
                  step={1}
                  title="安装 AI 工具"
                  desc="从 App Store 一键安装文生图、图生 UI、代码 Agent 等工具"
                  action={installed.length === 0 ? '浏览商店' : `${installed.length} 个已安装`}
                  done={installed.length > 0}
                  onClick={() => onNavigate('store')}
                />
                <StepCard
                  step={2}
                  title="加载模型"
                  desc="在模型市场选择一个 LLM，WebGPU 本地加速推理，离线可用"
                  action={currentModel ? '已加载' : '选择模型'}
                  done={!!currentModel}
                  onClick={() => onNavigate('models')}
                />
                <StepCard
                  step={3}
                  title="开始对话"
                  desc="加载模型后即可开始完全离线的 AI 对话，数据永不离开设备"
                  action={sessionsCount > 0 ? `${sessionsCount} 个会话` : '新建对话'}
                  done={sessionsCount > 0}
                  onClick={() => onNavigate('chat')}
                />
              </div>
            </div>

            {/* Installed Tools (if any) */}
            {installed.length > 0 && (
              <div className="rounded-2xl p-5"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold flex items-center gap-2"
                    style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    <span className="text-base">📌</span> 已安装工具
                  </h3>
                  <button
                    onClick={() => onNavigate('store')}
                    className="text-[10px] font-medium px-2 py-1 rounded-lg transition-all hover:bg-[var(--bg-tertiary)]"
                    style={{ color: 'var(--accent-light)' }}>
                    + 添加
                  </button>
                </div>
                <div className="space-y-2">
                  {installed.slice(0, 5).map(t => {
                    const info = CATEGORY_INFO[t.toolId] || Object.values(CATEGORY_INFO)[0];
                    const tool = getTool(t.toolId);
                    return (
                      <a
                        key={t.toolId}
                        href={getUrl(t.toolId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group no-underline"
                        style={{ background: 'var(--bg-secondary)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                          style={{ background: `${info.color}18` }}>
                          {tool?.icon || '🔧'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                            {tool?.name || t.toolId}
                          </p>
                          <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                            {info.label}{t.isPinned ? ' · 已置顶' : ''}
                          </p>
                        </div>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          style={{ color: 'var(--text-muted)' }}>
                          <path d="M7 17l9.2-9.2M17 17V7H7"/>
                        </svg>
                      </a>
                    );
                  })}
                  {installed.length > 5 && (
                    <p className="text-[10px] text-center pt-1" style={{ color: 'var(--text-muted)' }}>
                      +{installed.length - 5} 更多工具 · <button onClick={() => onNavigate('store')} className="hover:underline" style={{ color: 'var(--accent-light)' }}>查看全部</button>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right: Tool Catalog Overview + Stats */}
          <div className="space-y-6">
            {/* Available Resources */}
            <div className="rounded-2xl p-5"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
              }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                <span className="text-base">📊</span> 资源概览
              </h3>
              <div className="space-y-3">
                <ResourceRow
                  color="#8B5CF6"
                  label="LLM 模型"
                  value={`${MODEL_REGISTRY.length} 可下载`}
                  subtitle="本地 WebGPU 推理"
                  onClick={() => onNavigate('models')}
                />
                <ResourceRow
                  color="#06B6D4"
                  label="外部模型"
                  value={`${EXTERNAL_MODELS.length} 可接入`}
                  subtitle="文生图 · 图生UI · 语音 · 视频"
                  onClick={() => onNavigate('models')}
                />
                <ResourceRow
                  color="#EC4899"
                  label="工具目录"
                  value={`${TOOL_CATALOG.length} 个可用`}
                  subtitle={`覆盖 ${Object.keys(CATEGORY_INFO).length} 个品类`}
                  onClick={() => onNavigate('store')}
                />
                <ResourceRow
                  color="#10B981"
                  label="对话会话"
                  value={sessionsCount > 0 ? `${sessionsCount} 个` : '暂无'}
                  subtitle="IndexedDB 持久化存储"
                  onClick={() => onNavigate('chat')}
                />
              </div>
            </div>

            {/* Category Quick Access */}
            <div className="rounded-2xl p-5"
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-sm)',
              }}>
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2"
                style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                <span className="text-base">🗂️</span> 工具品类
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                  const count = TOOL_CATALOG.filter(t => t.category === key).length;
                  const installedCount = installed.filter(t => {
                    const tool = getTool(t.toolId);
                    return tool?.category === key;
                  }).length;
                  return (
                    <button
                      key={key}
                      onClick={() => onNavigate('store')}
                      className="rounded-xl p-3 text-left transition-all duration-200 hover:scale-[1.02] group"
                      style={{ background: `${info.color}0D`, border: `1px solid ${info.color}20` }}
                      onMouseEnter={e => { e.currentTarget.style.background = `${info.color}18`; }}
                      onMouseLeave={e => { e.currentTarget.style.background = `${info.color}0D`; }}
                    >
                      <span className="text-lg block mb-1">{info.icon}</span>
                      <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                        {info.label}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {count} 个工具{installedCount > 0 ? ` · ${installedCount} 已安装` : ''}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Brand footer */}
        <div className="mt-8 text-center pb-4">
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            Agent Hub v4.0 · 所有数据存储于本地浏览器 · 零数据泄漏 · 100% 隐私
          </p>
        </div>
      </div>
    </div>
  );
}

/* ====== Sub-components ====== */

function StatusCard({
  icon, label, value, color, subtitle, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  subtitle: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className="rounded-2xl p-4 text-left transition-all duration-300 group w-full"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      {...(onClick ? {
        onMouseEnter: (e: any) => {
          e.currentTarget.style.borderColor = `${color}40`;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 4px 20px ${color}15`;
        },
        onMouseLeave: (e: any) => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        },
      } : {})}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}15`, color }}>
          {icon}
        </div>
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
        {onClick && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: 'var(--text-muted)' }}>
            <path d="M7 17l9.2-9.2M17 17V7H7"/>
          </svg>
        )}
      </div>
      <p className="text-base font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
      <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
        {subtitle}
      </p>
    </Comp>
  );
}

function StepCard({
  step, title, desc, action, done, onClick,
}: {
  step: number;
  title: string;
  desc: string;
  action: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group"
      style={{ background: done ? 'var(--success-bg)' : 'var(--bg-secondary)' }}
      onMouseEnter={e => {
        if (!done) e.currentTarget.style.background = 'var(--bg-tertiary)';
      }}
      onMouseLeave={e => {
        if (!done) e.currentTarget.style.background = 'var(--bg-secondary)';
      }}
    >
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5"
        style={{
          background: done ? 'var(--success)' : 'var(--bg-tertiary)',
          color: done ? '#fff' : 'var(--text-muted)',
          border: done ? 'none' : '1px solid var(--border-subtle)',
        }}>
        {done ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : step}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <span className="text-[10px] px-2 py-1 rounded-lg font-medium shrink-0 self-center opacity-0 group-hover:opacity-100 transition-all"
        style={{
          background: done ? 'var(--success-bg)' : 'var(--accent-bg)',
          color: done ? 'var(--success)' : 'var(--accent-light)',
        }}>
        {action}
      </span>
    </button>
  );
}

function ResourceRow({
  color, label, value, subtitle, onClick,
}: {
  color: string;
  label: string;
  value: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group"
      style={{ background: 'var(--bg-secondary)' }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--bg-tertiary)';
        e.currentTarget.style.transform = 'translateX(2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--bg-secondary)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
      </div>
      <span className="text-[11px] font-semibold" style={{ color }}>{value}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        style={{ color: 'var(--text-muted)' }}>
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  );
}

/* ====== Icons ====== */

const CpuIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="4" y="4" width="16" height="16" rx="3"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M20 9h4M20 15h4M2 9h4M2 15h4" opacity="0.5"/>
  </svg>
);

const ModelIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const StorageIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>
);

const ToolsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
