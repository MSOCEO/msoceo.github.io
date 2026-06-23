import type { ConversationSession } from '../types';

interface SidebarProps {
  view: string;
  onViewChange: (v: 'dashboard' | 'chat' | 'models' | 'skills' | 'store') => void;
  sessions: ConversationSession[];
  activeSession: ConversationSession | null;
  onSessionSelect: (id: string) => void;
  onSessionDelete: (id: string) => void;
  onNewChat: () => void;
  onClose: () => void;
}

const NAV_ITEMS = [
  { key: 'dashboard', label: '控制台', icon: DashboardIcon, shortcut: '⌘1' },
  { key: 'chat',      label: '对话',   icon: ChatIcon,      shortcut: '⌘2' },
  { key: 'models',    label: '模型',   icon: CpuIcon,        shortcut: '⌘3' },
  { key: 'skills',    label: '插件',   icon: PluginIcon,     shortcut: '⌘4' },
  { key: 'store',     label: '商店',   icon: StoreIcon,      shortcut: '⌘5' },
] as const;

export function Sidebar({
  view, onViewChange, sessions, activeSession,
  onSessionSelect, onSessionDelete, onNewChat, onClose,
}: SidebarProps) {
  return (
    <aside className="w-60 flex flex-col border-r shrink-0 animate-fade-in-left relative"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
      }}>
      {/* Brand Header — 图形化 */}
      <div className="relative px-4 pt-5 pb-4 overflow-hidden">
        {/* 背景渐变光晕 */}
        <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full opacity-25 blur-xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent), transparent)' }} />
        <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full opacity-15 blur-xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--cyan), transparent)' }} />

        <div className="relative flex items-center gap-3">
          {/* 图形化 Logo */}
          <div className="relative">
            <div className="absolute inset-0 rounded-xl blur-md opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--cyan))' }} />
            <div className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #8B5CF6 40%, #06B6D4)',
                boxShadow: '0 0 24px rgba(139, 92, 246, 0.35)',
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 22 8.5 12 15 2 8.5"/>
                <polyline points="2 15 12 21.5 22 15" opacity="0.7"/>
                <polyline points="2 11.5 12 18.5 22 11.5" opacity="0.4"/>
              </svg>
            </div>
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              聚合控制台
            </h1>
            <p className="text-[10px] flex items-center gap-1.5 mt-0.5"
              style={{ color: 'var(--text-muted)', lineHeight: 1 }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--success)' }} />
              v4.0 · 本地运行
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg ml-auto transition-all hover:bg-[var(--bg-tertiary)]"
            style={{ color: 'var(--text-muted)' }}
            title="收起侧栏"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>
      </div>

      {/* 分割线 */}
      <div className="mx-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-subtle) 20%, var(--border-subtle) 80%, transparent)' }} />

      {/* 导航菜单 — 图形化 */}
      <nav className="px-3 py-3 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.key}
            label={item.label}
            active={view === item.key}
            onClick={() => onViewChange(item.key as any)}
            icon={<item.icon />}
            shortcut={item.shortcut}
          />
        ))}
      </nav>

      {/* 新建对话按钮 */}
      <div className="px-3 pb-2">
        <button
          onClick={onNewChat}
          className="w-full relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 active:scale-[0.97] overflow-hidden group"
          style={{ color: '#fff' }}>
          {/* 渐变背景 */}
          <div className="absolute inset-0 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6, #06B6D4)', backgroundSize: '200% 200%', animation: 'gradient-flow 3s ease infinite' }} />
          {/* 光晕叠加 */}
          <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)' }} />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="relative z-10">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <span className="relative z-10">新建对话</span>
        </button>
      </div>

      {/* 分割线 */}
      <div className="mx-4 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-subtle) 20%, var(--border-subtle) 80%, transparent)' }} />

      {/* 历史记录 — 图形化 */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
        <div className="flex items-center justify-between px-1 mb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest flex items-center gap-1.5"
            style={{ color: 'var(--text-muted)' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" opacity="0.6">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            历史记录
          </span>
          {sessions.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {sessions.length}
            </span>
          )}
        </div>

        {sessions.length === 0 ? (
          <div className="py-10 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-tertiary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4"
                style={{ color: 'var(--text-muted)' }}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>暂无对话记录</p>
            <p className="text-[10px] mt-1 opacity-60" style={{ color: 'var(--text-muted)' }}>
              点击上方按钮开始
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {sessions.slice(0, 50).map(session => (
              <button
                key={session.id}
                onClick={() => onSessionSelect(session.id)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-left group transition-all duration-150"
                style={{
                  background: activeSession?.id === session.id ? 'var(--accent-bg)' : 'transparent',
                  color: activeSession?.id === session.id ? 'var(--accent-light)' : 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  if (activeSession?.id !== session.id) {
                    e.currentTarget.style.background = 'var(--bg-tertiary)';
                  }
                }}
                onMouseLeave={e => {
                  if (activeSession?.id !== session.id) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {/* 会话图标 */}
                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: activeSession?.id === session.id ? 'var(--accent-bg-hover)' : 'var(--bg-tertiary)', opacity: activeSession?.id === session.id ? 1 : 0.5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                  </svg>
                </div>
                <span className="truncate flex-1">{session.title}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onSessionDelete(session.id); }}
                  className="w-5 h-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
                  title="删除"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 底部状态 — 图形化 */}
      <div className="px-4 py-3 border-t relative overflow-hidden"
        style={{ borderColor: 'var(--border-subtle)' }}>
        {/* 底部微光 */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-16 rounded-full opacity-15 blur-2xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent), transparent)' }} />
        <div className="relative flex items-center gap-2.5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-sm opacity-30 animate-pulse-dot"
              style={{ background: 'var(--success)' }} />
            <div className="relative w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: 'var(--bg-tertiary)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                style={{ color: 'var(--success)' }}>
                <rect x="4" y="4" width="16" height="16" rx="3"/>
                <path d="M9 2v4M15 2v4M9 18v4M15 18v4M20 9h4M20 15h4M2 9h4M2 15h4" opacity="0.5"/>
              </svg>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
              WebGPU 就绪
              <span className="w-1.5 h-1.5 rounded-full animate-pulse-dot" style={{ background: 'var(--success)' }} />
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>全部本地运行</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ label, active, onClick, icon, shortcut }: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  shortcut?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden"
      style={{
        background: active ? 'var(--accent-bg)' : 'transparent',
        color: active ? 'var(--accent-light)' : 'var(--text-secondary)',
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.background = 'var(--bg-tertiary)';
          e.currentTarget.style.color = 'var(--text-primary)';
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'var(--text-secondary)';
        }
      }}
    >
      {/* 激活态左侧彩色指示条 */}
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
          style={{ background: 'linear-gradient(180deg, var(--accent), var(--cyan))' }} />
      )}
      {/* 图标容器 */}
      <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200"
        style={{
          background: active ? 'var(--accent-bg-hover)' : 'transparent',
          opacity: active ? 1 : 0.55,
        }}>
        {icon}
      </span>
      <span className="flex-1 text-left">{label}</span>
      {shortcut && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-mono tracking-wider opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
          }}>
          {shortcut}
        </span>
      )}
    </button>
  );
}

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    <path d="M8 9h8M8 13h5" opacity="0.5"/>
  </svg>
);

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1.5"/>
    <rect x="14" y="3" width="7" height="5" rx="1.5"/>
    <rect x="3" y="16" width="7" height="5" rx="1.5"/>
    <rect x="14" y="12" width="7" height="9" rx="1.5"/>
  </svg>
);

const StoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1.5"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5"/>
  </svg>
);

const CpuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="4" y="4" width="16" height="16" rx="3"/>
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M20 9h4M20 15h4M2 9h4M2 15h4" opacity="0.5"/>
  </svg>
);

const PluginIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86l1.82-1.82a1 1 0 011.41 0L17.2 5.9a1 1 0 010 1.41l-1.82 1.82"/>
    <path d="M13.41 9.34l-4.23 4.23a1 1 0 000 1.41l3.54 3.54a1 1 0 001.41 0l4.23-4.23"/>
    <circle cx="6.5" cy="17.5" r="2.5" opacity="0.5"/>
  </svg>
);
