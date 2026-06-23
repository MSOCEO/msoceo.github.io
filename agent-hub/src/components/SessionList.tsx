import { useState, useEffect, useRef } from 'react';
import type { ConversationSession } from '../types';

interface SessionListProps {
  sessions: ConversationSession[];
  activeId: string | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}

export default function SessionList({
  sessions, activeId, isOpen, onToggle,
  onSelect, onCreate, onDelete, onRename,
}: SessionListProps) {
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editingId) inputRef.current?.focus(); }, [editingId]);

  const filtered = search
    ? sessions.filter(s => s.title.toLowerCase().includes(search.toLowerCase()))
    : sessions;

  const startRename = (s: ConversationSession) => {
    setEditingId(s.id);
    setEditTitle(s.title);
  };
  const commitRename = () => {
    if (editingId && editTitle.trim()) onRename(editingId, editTitle.trim());
    setEditingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定删除此对话？')) onDelete(id);
  };

  return (
    <>
      {/* Collapsed toggle button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all duration-200"
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            boxShadow: 'var(--shadow-md)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
          title="展开会话列表"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M3 3h12M3 9h12M3 15h12"/>
          </svg>
        </button>
      )}

      {/* Panel */}
      <aside
        className="fixed left-0 top-[68px] bottom-0 z-20 flex flex-col transition-all duration-350"
        style={{
          width: isOpen ? 260 : 0,
          opacity: isOpen ? 1 : 0,
          overflow: isOpen ? 'visible' : 'hidden',
          background: 'var(--bg-surface)',
          borderRight: isOpen ? '1px solid var(--border-subtle)' : 'none',
        }}
      >
        <div className="flex-shrink-0 p-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-[12px] font-semibold tracking-wide uppercase"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)' }}
            >
              会话列表
            </span>
            <button
              onClick={onToggle}
              className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-none transition-all duration-150"
              style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              title="折叠侧栏"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M9 3L4.5 7l4.5 4"/>
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-2.5">
            <svg
              className="absolute left-2.5 top-1/2 -translate-y-1/2"
              width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <circle cx="6" cy="6" r="4.5"/><path d="M9.5 9.5L13 13"/>
            </svg>
            <input
              type="text"
              placeholder="搜索会话..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg outline-none text-[12px] transition-all duration-200"
              style={{
                background: 'var(--bg-card)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'var(--font-body)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
            />
          </div>

          {/* New chat button */}
          <button
            onClick={onCreate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(0,102,255,0.12), rgba(0,212,255,0.08))',
              color: 'var(--text-accent)',
              border: '1px solid var(--border-accent)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,102,255,0.18), rgba(0,212,255,0.12))'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,102,255,0.12), rgba(0,212,255,0.08))'; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M7 2v10M2 7h10"/>
            </svg>
            新建对话
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
              {search ? '未找到匹配的对话' : '暂无对话记录'}
            </div>
          )}
          {filtered.map(s => (
            <div
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 relative"
              style={{
                background: activeId === s.id ? 'var(--accent-bg)' : 'transparent',
                border: activeId === s.id ? '1px solid var(--border-accent)' : '1px solid transparent',
              }}
              onMouseEnter={e => { if (activeId !== s.id) e.currentTarget.style.background = 'var(--bg-card)'; }}
              onMouseLeave={e => { if (activeId !== s.id) e.currentTarget.style.background = 'transparent'; }}
            >
              {/* Active indicator bar */}
              {activeId === s.id && (
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  style={{ background: 'var(--accent)' }}
                />
              )}

              {/* Title */}
              {editingId === s.id ? (
                <input
                  ref={inputRef}
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setEditingId(null); }}
                  className="flex-1 px-2 py-1 rounded text-[12px] outline-none border"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border-accent)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              ) : (
                <span
                  className="flex-1 text-[13px] truncate"
                  style={{ color: activeId === s.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                >
                  {s.title}
                </span>
              )}

              {/* Action buttons (hover) */}
              <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                <button
                  onClick={e => { e.stopPropagation(); startRename(s); }}
                  className="w-6 h-6 rounded flex items-center justify-center cursor-pointer border-none transition-all duration-100"
                  style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                  title="重命名"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8.5 1.5l2 2-7 7H1.5v-2l7-7z"/>
                  </svg>
                </button>
                <button
                  onClick={e => handleDelete(e, s.id)}
                  className="w-6 h-6 rounded flex items-center justify-center cursor-pointer border-none transition-all duration-100"
                  style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--error-bg)'; e.currentTarget.style.color = 'var(--error)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                  title="删除"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 3.5l6 6M9 3.5l-6 6"/><path d="M2.5 2.5h7v0a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v0z"/>
                  </svg>
                </button>
              </div>

              {/* Date */}
              <span className="text-[10px] flex-shrink-0 ml-1 group-hover:hidden" style={{ color: 'var(--text-tertiary)' }}>
                {formatDate(s.updatedAt)}
              </span>

              {/* Message count badge */}
              {s.messages.length > 0 && (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 group-hover:hidden"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}
                >
                  {s.messages.length}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Footer stats */}
        <div
          className="flex-shrink-0 px-4 py-3 flex items-center justify-between text-[11px]"
          style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}
        >
          <span>{sessions.length} 个对话</span>
          <span>{sessions.reduce((sum, s) => sum + s.messages.length, 0)} 条消息</span>
        </div>
      </aside>
    </>
  );
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  if (diffDays === 1) return '昨天';
  if (diffDays < 7) return `${diffDays}天前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}
