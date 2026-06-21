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
    <aside className="w-60 flex flex-col border-r shrink-0 animate-fade-in-left"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-subtle)',
      }}>
      {/* Brand Header */}
      <div className="h-14 flex items-center gap-2.5 px-4 border-b"
        style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, var(--accent-deep), var(--accent))' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            Agent Hub
          </h1>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)', lineHeight: 1.2 }}>
            v3.0 · Local AI
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg ml-auto transition-all hover:bg-[var(--bg-tertiary)]"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-3 space-y-0.5">
        <NavItem
          label="Chat"
          active={view === 'chat'}
          onClick={() => onViewChange('chat')}
          icon={<ChatIcon />}
          shortcut="1"
        />
        <NavItem
          label="Models"
          active={view === 'models'}
          onClick={() => onViewChange('models')}
          icon={<CpuIcon />}
          shortcut="2"
        />
        <NavItem
          label="Plugins"
          active={view === 'skills'}
          onClick={() => onViewChange('skills')}
          icon={<PluginIcon />}
          shortcut="3"
        />
      </nav>

      {/* New Chat */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
          style={{
            background: 'linear-gradient(135deg, var(--accent-deep), var(--accent))',
            color: '#fff',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          New Chat
        </button>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px" style={{ background: 'var(--border-subtle)' }} />

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
        <div className="flex items-center justify-between px-1 mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            History
          </span>
          {sessions.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              {sessions.length}
            </span>
          )}
        </div>

        {sessions.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No conversations yet
            </p>
            <p className="text-[10px] mt-1 opacity-60" style={{ color: 'var(--text-muted)' }}>
              Start a new chat above
            </p>
          </div>
        )}

        <div className="space-y-0.5">
          {sessions.slice(0, 50).map(session => (
            <button
              key={session.id}
              onClick={() => onSessionSelect(session.id)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left group transition-all duration-150"
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
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 opacity-40">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <span className="truncate flex-1">{session.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onSessionDelete(session.id); }}
                className="w-5 h-5 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0 hover:bg-red-500/15"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--error)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px]"
            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
              WebGPU Ready
            </p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Everything runs locally
            </p>
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
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative"
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
      <span className="w-5 h-5 flex items-center justify-center shrink-0" style={{ opacity: active ? 1 : 0.6 }}>
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    <path d="M8 9h8M8 13h5" opacity="0.5"/>
  </svg>
);

const CpuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="4" y="4" width="16" height="16" rx="3"/>
    <path d="M9 2v4M15 2v4M9 18v4M15 18v4M20 9h4M20 15h4M2 9h4M2 15h4" opacity="0.5"/>
  </svg>
);

const PluginIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86l1.82-1.82a1 1 0 011.41 0L17.2 5.9a1 1 0 010 1.41l-1.82 1.82"/>
    <path d="M13.41 9.34l-4.23 4.23a1 1 0 000 1.41l3.54 3.54a1 1 0 001.41 0l4.23-4.23"/>
    <circle cx="6.5" cy="17.5" r="2.5" opacity="0.5"/>
  </svg>
);
