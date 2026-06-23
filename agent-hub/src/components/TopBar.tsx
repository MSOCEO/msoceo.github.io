import { useMemo } from 'react';

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

const VIEW_META: Record<string, { title: string; desc: string; icon: string }> = {
  dashboard: { title: '控制台', desc: '系统概览与快捷入口', icon: '⊞' },
  chat:      { title: '对话', desc: 'AI 对话 · 本地推理', icon: '💬' },
  models:    { title: '模型市场', desc: '管理已加载与可用的 AI 模型', icon: '🧩' },
  skills:    { title: '插件管理', desc: '启用/禁用功能插件', icon: '⚡' },
  store:     { title: 'App Store', desc: '安装 AI 工具到控制台', icon: '🏪' },
};

export default function TopBar({
  view, currentModel, webgpuSupported, toolsInstalled, totalTools,
  sessionsCount, activeSkills, onNewChat,
}: TopBarProps) {
  const meta = VIEW_META[view] || VIEW_META.dashboard;

  return (
    <div className="flex items-center gap-4 px-6 py-2.5 border-b shrink-0 select-none"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
      }}>
      {/* Left: Breadcrumb + Title */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-sm opacity-50" style={{ color: 'var(--text-muted)' }}>
          {meta.icon}
        </span>
        <span className="text-xs font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
          {meta.title}
        </span>
        <span className="hidden sm:inline text-[11px] opacity-40 mx-1" style={{ color: 'var(--text-muted)' }}>•</span>
        <span className="hidden sm:inline text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
          {meta.desc}
        </span>
      </div>

      {/* Center: Status Chips */}
      <div className="hidden md:flex items-center gap-2">
        <StatusChip
          label="WebGPU"
          active={webgpuSupported}
          activeColor="var(--success)"
          idleColor="var(--text-muted)"
        />
        <StatusChip
          label={currentModel || 'No Model'}
          active={!!currentModel}
          activeColor="var(--accent-light)"
          idleColor="var(--text-muted)"
        />
        <StatusChip
          label={`${toolsInstalled}/${totalTools} Tools`}
          active={toolsInstalled > 0}
          activeColor="var(--cyan-light)"
          idleColor="var(--text-muted)"
        />
        {activeSkills > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)' }}>
            {activeSkills} Skills
          </span>
        )}
      </div>

      {/* Right: Quick Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {sessionsCount > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            {sessionsCount} Sessions
          </span>
        )}
        {onNewChat && (
          <button
            onClick={onNewChat}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--accent-deep), var(--accent))',
              color: '#fff',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Chat
          </button>
        )}
      </div>
    </div>
  );
}

function StatusChip({
  label, active, activeColor, idleColor,
}: {
  label: string;
  active: boolean;
  activeColor: string;
  idleColor: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{
        background: active ? `${activeColor}12` : 'var(--bg-tertiary)',
        color: active ? activeColor : idleColor,
        border: active ? `1px solid ${activeColor}30` : '1px solid transparent',
      }}>
      <span className="w-1.5 h-1.5 rounded-full"
        style={{ background: active ? activeColor : idleColor, opacity: active ? 1 : 0.4 }} />
      {label}
    </span>
  );
}
