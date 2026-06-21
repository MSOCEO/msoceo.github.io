// ============================================================
// Agent Hub - Sidebar
// ============================================================

import type { ConversationSession } from '../types';

interface SidebarProps {
  view: string;
  onViewChange: (v: 'chat' | 'models' | 'skills') => void;
  sessions: ConversationSession[];
  activeSession: ConversationSession | null;
  onSessionSelect: (id: string) => void;
  onSessionDelete: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

export function Sidebar({
  view, onViewChange, sessions, activeSession,
  onSessionSelect, onSessionDelete, onNewChat, onClose,
}: SidebarProps) {
  return (
    <aside className="w-60 flex flex-col border-r border-[var(--border)] bg-[var(--bg-secondary)] shrink-0">
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-4 border-b border-[var(--border)]">
        <span className="text-xs font-medium text-[var(--text-secondary)] tracking-wide uppercase">Navigation</span>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>

      {/* Nav Items */}
      <nav className="px-2 py-3 space-y-0.5">
        <NavItem icon={ChatIcon} label="对话" active={view === 'chat'} onClick={() => onViewChange('chat')} />
        <NavItem icon={CpuIcon} label="模型管理" active={view === 'models'} onClick={() => onViewChange('models')} />
        <NavItem icon={PluginIcon} label="插件市场" active={view === 'skills'} onClick={() => onViewChange('skills')} />
      </nav>

      {/* Divider */}
      <div className="mx-3 my-2 h-px bg-[var(--border)]" />

      {/* New Chat Button */}
      <div className="px-3 mb-2">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
          新对话
        </button>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider px-2 py-1">历史对话</div>
        {sessions.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] px-2 py-4 text-center">暂无历史对话</p>
        )}
        {sessions.slice(0, 50).map(session => (
          <button
            key={session.id}
            onClick={() => onSessionSelect(session.id)}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-left group transition-colors ${
              activeSession?.id === session.id
                ? 'bg-[var(--accent-bg)] text-[var(--accent-light)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            <span className="truncate flex-1">{session.title}</span>
            <span
              onClick={(e) => { e.stopPropagation(); onSessionDelete(session.id); }}
              className="hidden group-hover:flex w-5 h-5 items-center justify-center rounded hover:bg-red-500/20 hover:text-red-400 text-[var(--text-muted)] shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: {
  icon: React.FC<{ className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
        active
          ? 'bg-[var(--accent-bg)] text-[var(--accent-light)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

const ChatIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
);

const CpuIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/>
  </svg>
);

const PluginIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14.7 2.3a1 1 0 00-1.4 0L9.6 6a1 1 0 000 1.4l1.7 1.7-6.6 6.6a1 1 0 000 1.4l3.6 3.6a1 1 0 001.4 0l6.6-6.6L18 14.4a1 1 0 001.4 0l3.6-3.6a1 1 0 000-1.4L14.7 2.3z"/>
  </svg>
);
