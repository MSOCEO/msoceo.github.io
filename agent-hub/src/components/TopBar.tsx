interface TopBarProps {
  view: 'dashboard' | 'chat' | 'models' | 'skills' | 'store';
  currentModel: string | null;
  webgpuSupported: boolean;
  toolsInstalled: number;
  totalTools: number;
  sessionsCount: number;
  activeSkills: number;
  onNewChat?: () => void;
}

const VIEW_META: Record<string, { title: string; desc: string; icon: string; color: string }> = {
  dashboard: { title: '控制台', desc: '系统概览 · 快捷入口', icon: '⊞', color: '#8B5CF6' },
  chat:      { title: '对话',   desc: 'AI 对话 · 本地推理', icon: '💬', color: '#06B6D4' },
  models:    { title: '模型',   desc: '管理可用 AI 模型', icon: '🧩', color: '#F59E0B' },
  skills:    { title: '插件',   desc: '启用功能插件', icon: '⚡', color: '#10B981' },
  store:     { title: '商店',   desc: '安装 AI 工具到控制台', icon: '🏪', color: '#EC4899' },
};

export default function TopBar({
  view, currentModel, webgpuSupported, toolsInstalled, totalTools,
  sessionsCount, activeSkills, onNewChat,
}: TopBarProps) {
  const meta = VIEW_META[view] || VIEW_META.dashboard;

  return (
    <div className="flex items-center gap-4 px-5 py-2.5 border-b shrink-0 select-none relative"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
      }}>
      {/* 顶部微光条 */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px opacity-30 pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, ${meta.color}, transparent)` }} />

      {/* 左侧：视图标题 */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${meta.color}15` }}>
          <span className="text-sm">{meta.icon}</span>
        </div>
        <div>
          <span className="text-sm font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            {meta.title}
          </span>
          <span className="hidden sm:inline text-[11px] ml-2" style={{ color: 'var(--text-muted)' }}>
            {meta.desc}
          </span>
        </div>
      </div>

      {/* 中间：图形化状态芯片 */}
      <div className="hidden md:flex items-center gap-2">
        <GpuChip active={webgpuSupported} />
        <ModelChip label={currentModel} active={!!currentModel} />
        <ToolsChip installed={toolsInstalled} total={totalTools} />
        {activeSkills > 0 && (
          <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-full font-medium"
            style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            {activeSkills} 插件
          </span>
        )}
      </div>

      {/* 右侧：快捷操作 */}
      <div className="flex items-center gap-2 shrink-0">
        {sessionsCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            {sessionsCount} 会话
          </span>
        )}
        {onNewChat && (
          <button
            onClick={onNewChat}
            className="relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95 overflow-hidden group"
            style={{ color: '#fff' }}>
            <div className="absolute inset-0 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6, #06B6D4)', backgroundSize: '200% 200%', animation: 'gradient-flow 3s ease infinite' }} />
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="relative z-10">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span className="relative z-10">对话</span>
          </button>
        )}
      </div>
    </div>
  );
}

/* ===== 图形化状态芯片 ===== */

function GpuChip({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium transition-all duration-300"
      style={{
        background: active ? 'rgba(16,185,129,0.1)' : 'var(--bg-tertiary)',
        color: active ? 'var(--success)' : 'var(--text-muted)',
        border: `1px solid ${active ? 'rgba(16,185,129,0.3)' : 'var(--border-subtle)'}`,
      }}>
      <span className="relative">
        {active && (
          <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: 'var(--success)' }} />
        )}
        <span className="relative block w-1.5 h-1.5 rounded-full"
          style={{ background: active ? 'var(--success)' : 'var(--text-muted)', opacity: active ? 1 : 0.4 }} />
      </span>
      WebGPU
    </span>
  );
}

function ModelChip({ label, active }: { label: string | null; active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium"
      style={{
        background: active ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
        color: active ? 'var(--accent-light)' : 'var(--text-muted)',
        border: active ? '1px solid var(--border-accent)' : '1px solid transparent',
      }}>
      <span className="w-1.5 h-1.5 rounded-full"
        style={{ background: active ? 'var(--accent)' : 'var(--text-muted)', opacity: active ? 1 : 0.4 }} />
      {label || '未加载'}
    </span>
  );
}

function ToolsChip({ installed, total }: { installed: number; total: number }) {
  const active = installed > 0;
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-medium"
      style={{
        background: active ? 'rgba(6,182,212,0.1)' : 'var(--bg-tertiary)',
        color: active ? 'var(--cyan-light)' : 'var(--text-muted)',
        border: `1px solid ${active ? 'rgba(6,182,212,0.25)' : 'transparent'}`,
      }}>
      <span className="w-1.5 h-1.5 rounded-full"
        style={{ background: active ? 'var(--cyan)' : 'var(--text-muted)', opacity: active ? 1 : 0.4 }} />
      {installed}/{total} 工具
    </span>
  );
}
