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
  const { installed, getTool } = useToolRegistry();
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
  const readySteps = [installed.length > 0, !!currentModel, sessionsCount > 0].filter(Boolean).length;

  return (
    <div className="h-full overflow-y-auto animate-view-enter">
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* ===== 系统总览 Hero 卡片 ===== */}
        <div className="relative rounded-3xl p-6 mb-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #0F0A1A 0%, #1A1030 50%, #0A1628 100%)',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 4px 32px rgba(139, 92, 246, 0.08)',
          }}>
          {/* 背景图形元素 */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--accent), transparent 70%)', transform: 'translate(20%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-15 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, var(--cyan), transparent 70%)', transform: 'translate(-20%, 30%)' }} />
          {/* 网格纹理 */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, var(--accent-light) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }} />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--success)' }} />
              <span className="text-[11px] font-medium opacity-60" style={{ color: 'var(--accent-light)' }}>系统运行中</span>
            </div>
            <h2 className="text-2xl font-bold tracking-[-0.02em] mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              AI 聚合控制台
              <span className="ml-3 text-sm font-normal opacity-50" style={{ color: 'var(--text-muted)' }}>v4.0</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-2xl mb-4" style={{ color: 'var(--text-secondary)' }}>
              本地运行的 AI 工具中枢 — 从 LLM 对话到文生图、图生 UI、代码 Agent，一站式管理。
            </p>

            {/* 关键指标行 */}
            <div className="flex flex-wrap items-center gap-4">
              <MetricPill color={webgpuSupported ? '#10B981' : '#64748B'} label="WebGPU" value={webgpuSupported ? '就绪' : '不可用'} />
              <MetricPill color="#8B5CF6" label="LLM 模型" value={`${MODEL_REGISTRY.length} 个`} />
              <MetricPill color="#06B6D4" label="外部模型" value={`${EXTERNAL_MODELS.length} 个`} />
              <MetricPill color="#EC4899" label="工具目录" value={`${TOOL_CATALOG.length} 个`} />
              <MetricPill color="#F59E0B" label="已安装" value={`${installed.length} 个`} />
            </div>
          </div>
        </div>

        {/* ===== 状态卡片行 ===== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatusCard
            icon={<GpuGlowIcon active={webgpuSupported} />}
            label="WebGPU 加速"
            value={webgpuSupported ? '硬件就绪' : '不可用'}
            color="#10B981"
            active={webgpuSupported}
            subtitle={webgpuSupported ? '浏览器支持 GPU 推理' : '建议使用 Chrome/Edge'}
          />
          <StatusCard
            icon={<ModelGlowIcon active={!!currentModel} />}
            label="当前模型"
            value={currentModel || '未加载'}
            color="#8B5CF6"
            active={!!currentModel}
            subtitle={currentModel ? '已缓存到本地' : '前往模型页面加载'}
            onClick={currentModel ? undefined : () => onNavigate('models')}
          />
          <StatusCard
            icon={<StorageGlowIcon />}
            label="本地存储"
            value={storageEstimate ? formatBytes(storageEstimate.usage) : '—'}
            color="#06B6D4"
            active={!!storageEstimate}
            subtitle={storageEstimate ? `共 ${formatBytes(storageEstimate.quota)} 可用` : '计算中...'}
          />
          <StatusCard
            icon={<ToolsGlowIcon active={installed.length > 0} />}
            label="已安装工具"
            value={`${installed.length} 个`}
            color="#F59E0B"
            active={installed.length > 0}
            subtitle={installed.length > 0 ? `${pinned.length} 个已置顶` : '前往商店安装'}
            onClick={installed.length === 0 ? () => onNavigate('store') : undefined}
          />
        </div>

        {/* ===== 双列布局 ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* 左列：快速开始 + 已安装 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 快速开始 */}
            <SectionCard title="快速上手" icon="🚀" accentColor="#8B5CF6">
              <div className="space-y-3">
                <StepCard step={1} title="安装工具" desc="从商店安装文生图、代码 Agent 等 AI 工具"
                  action={installed.length === 0 ? '浏览商店' : `${installed.length} 个已装`}
                  done={installed.length > 0} onClick={() => onNavigate('store')} />
                <StepCard step={2} title="加载模型" desc="选择 LLM 模型，WebGPU 本地加速推理"
                  action={currentModel ? '已加载' : '选择模型'}
                  done={!!currentModel} onClick={() => onNavigate('models')} />
                <StepCard step={3} title="开始对话" desc="加载后即可离线对话，数据永不离开设备"
                  action={sessionsCount > 0 ? `${sessionsCount} 个会话` : '新建对话'}
                  done={sessionsCount > 0} onClick={() => onNavigate('chat')} />
              </div>
              {/* 进度条 */}
              <div className="mt-4 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{
                      background: 'linear-gradient(90deg, var(--accent), var(--cyan))',
                      width: `${(readySteps / 3) * 100}%`,
                    }} />
                </div>
                <span className="text-[10px] font-medium" style={{ color: 'var(--accent-light)' }}>{readySteps}/3</span>
              </div>
            </SectionCard>

            {/* 已安装工具 */}
            {installed.length > 0 && (
              <SectionCard title="已装工具" icon="📌" accentColor="#F59E0B">
                <div className="grid grid-cols-2 gap-2">
                  {installed.slice(0, 6).map(t => {
                    const tool = getTool(t.toolId);
                    const catInfo = CATEGORY_INFO[tool?.category || ''] || Object.values(CATEGORY_INFO)[0];
                    return (
                      <a key={t.toolId} href={tool?.url || '#'} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all group no-underline"
                        style={{ background: 'var(--bg-secondary)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                          style={{ background: `${catInfo.color}18` }}>
                          {tool?.icon || '🔧'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium truncate" style={{ color: 'var(--text-primary)' }}>{tool?.name || t.toolId}</p>
                          <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{catInfo.label}</p>
                        </div>
                      </a>
                    );
                  })}
                </div>
                {installed.length > 6 && (
                  <button onClick={() => onNavigate('store')} className="w-full text-center text-[10px] py-1.5 mt-2 rounded-lg transition-colors hover:bg-[var(--bg-tertiary)]"
                    style={{ color: 'var(--accent-light)' }}>
                    查看全部 {installed.length} 个工具 →
                  </button>
                )}
              </SectionCard>
            )}
          </div>

          {/* 右列：品类分布 + 资源概览 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 品类环形图 */}
            <SectionCard title="工具品类" icon="🗂️" accentColor="#06B6D4">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CATEGORY_INFO).map(([key, info]) => {
                  const count = TOOL_CATALOG.filter(t => t.category === key).length;
                  const installedCount = installed.filter(t => {
                    const tool = getTool(t.toolId);
                    return tool?.category === key;
                  }).length;
                  const ratio = Math.min((count / Math.max(...Object.values(CATEGORY_INFO).map(() => 1))) * 100, 100);
                  return (
                    <button key={key} onClick={() => onNavigate('store')}
                      className="rounded-xl p-3 text-left transition-all duration-200 group"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `${info.color}40`;
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg">{info.icon}</span>
                        <span className="text-[13px] font-bold" style={{ color: info.color }}>{count}</span>
                      </div>
                      <p className="text-[11px] font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{info.label}</p>
                      {/* 迷你进度条 */}
                      <div className="h-1 rounded-full overflow-hidden mt-1.5" style={{ background: 'var(--bg-tertiary)' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ background: info.color, width: `${Math.max((count / TOOL_CATALOG.length) * 100, 8)}%` }} />
                      </div>
                      {installedCount > 0 && (
                        <p className="text-[10px] mt-1" style={{ color: info.color }}>已装 {installedCount} 个</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* 资源统计 */}
            <SectionCard title="资源总览" icon="📊" accentColor="#EC4899">
              <div className="space-y-2">
                <StatRow color="#8B5CF6" icon="🧠" label="LLM 模型" value={`${MODEL_REGISTRY.length}`} unit="可下载" onClick={() => onNavigate('models')} />
                <StatRow color="#06B6D4" icon="🌐" label="外部模型" value={`${EXTERNAL_MODELS.length}`} unit="可接入" onClick={() => onNavigate('models')} />
                <StatRow color="#EC4899" icon="🔧" label="工具目录" value={`${TOOL_CATALOG.length}`} unit="个可用" onClick={() => onNavigate('store')} />
                <StatRow color="#10B981" icon="💬" label="对话会话" value={`${sessionsCount}`} unit="个" onClick={() => onNavigate('chat')} />
              </div>
            </SectionCard>
          </div>
        </div>

        {/* 底部 */}
        <div className="mt-8 text-center pb-4">
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            聚合控制台 v4.0 · 全部数据存储于本地浏览器 · 零泄漏 · 100% 隐私
          </p>
        </div>
      </div>
    </div>
  );
}

/* ====== 子组件 ====== */

function SectionCard({ title, icon, accentColor, children }: {
  title: string; icon: string; accentColor: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}>
      {/* 顶部彩色指示条 */}
      <div className="absolute top-0 left-4 right-4 h-px opacity-30"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }} />
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
        <span className="text-base">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function MetricPill({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      <span className="opacity-60">{label}</span>
      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

function StatusCard({
  icon, label, value, color, active, subtitle, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
  active: boolean;
  subtitle: string;
  onClick?: () => void;
}) {
  const Comp = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick}
      className="rounded-2xl p-4 text-left transition-all duration-300 group w-full relative overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${active ? `${color}25` : 'var(--border-subtle)'}`,
        boxShadow: active ? `0 0 20px ${color}08` : 'var(--shadow-sm)',
        cursor: onClick ? 'pointer' : 'default',
      }}
      {...(onClick ? {
        onMouseEnter: (e: any) => {
          e.currentTarget.style.borderColor = `${color}50`;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 4px 24px ${color}12`;
        },
        onMouseLeave: (e: any) => {
          e.currentTarget.style.borderColor = `1px solid ${active ? `${color}25` : 'var(--border-subtle)'}`;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = active ? `0 0 20px ${color}08` : 'var(--shadow-sm)';
        },
      } : {})}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          {active && (
            <div className="absolute inset-0 rounded-lg blur-md opacity-40"
              style={{ background: color }} />
          )}
          <div className="relative w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: `${color}12` }}>
            {icon}
          </div>
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
      <p className="text-lg font-bold tracking-tight" style={{ color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
        {value}
      </p>
      <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
    </Comp>
  );
}

function StepCard({ step, title, desc, action, done, onClick }: {
  step: number; title: string; desc: string; action: string; done: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group"
      style={{ background: done ? 'var(--success-bg)' : 'var(--bg-secondary)' }}
      onMouseEnter={e => { if (!done) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
      onMouseLeave={e => { if (!done) e.currentTarget.style.background = 'var(--bg-secondary)'; }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold mt-0.5 relative"
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
        {done && (
          <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'var(--success)' }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-[11px] mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <span className="text-[10px] px-2 py-1 rounded-lg font-medium shrink-0 self-center opacity-0 group-hover:opacity-100 transition-all"
        style={{ background: done ? 'var(--success-bg)' : 'var(--accent-bg)', color: done ? 'var(--success)' : 'var(--accent-light)' }}>
        {action}
      </span>
    </button>
  );
}

function StatRow({ color, icon, label, value, unit, onClick }: {
  color: string; icon: string; label: string; value: string; unit: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group"
      style={{ background: 'var(--bg-secondary)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.transform = 'translateX(2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-secondary)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
      <span className="text-base">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{unit}</p>
      </div>
      <span className="text-lg font-bold" style={{ color }}>{value}</span>
    </button>
  );
}

/* ====== 图形化图标 ====== */

function GpuGlowIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ color: active ? '#10B981' : '#64748B' }}>
      <rect x="4" y="4" width="16" height="16" rx="3"/>
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M20 9h4M20 15h4M2 9h4M2 15h4" opacity="0.5"/>
    </svg>
  );
}

function ModelGlowIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ color: active ? '#8B5CF6' : '#64748B' }}>
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5" opacity="0.7"/>
      <path d="M2 12l10 5 10-5" opacity="0.4"/>
    </svg>
  );
}

function StorageGlowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ color: '#06B6D4' }}>
      <ellipse cx="12" cy="5" rx="9" ry="3"/>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>
  );
}

function ToolsGlowIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      style={{ color: active ? '#F59E0B' : '#64748B' }}>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
