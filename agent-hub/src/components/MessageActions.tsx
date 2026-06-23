import { useState } from 'react';
import type { ChatMessage } from '../types';

interface MessageActionsProps {
  message: ChatMessage;
  onCopy: (content: string) => void;
  onRetry: (msg: ChatMessage) => void;
  onEdit: (msg: ChatMessage) => void;
  onContinue: (msg: ChatMessage) => void;
  onFavorite: (msg: ChatMessage) => void;
  onExport: (msg: ChatMessage) => void;
}

const ACTIONS = [
  { id: 'copy', label: '复制', icon: CopyIcon, shortcut: '⌘C' },
  { id: 'retry', label: '重试', icon: RetryIcon, shortcut: '' },
  { id: 'edit', label: '编辑', icon: EditIcon, shortcut: '' },
  { id: 'continue', label: '继续生成', icon: ContinueIcon, shortcut: '' },
  { id: 'favorite', label: '收藏', icon: StarIcon, shortcut: '' },
  { id: 'export', label: '导出', icon: ExportIcon, shortcut: '' },
];

export default function MessageActions({
  message, onCopy, onRetry, onEdit, onContinue, onFavorite, onExport,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case 'copy': navigator.clipboard.writeText(message.content).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); break;
      case 'retry': onRetry(message); break;
      case 'edit': onEdit(message); break;
      case 'continue': onContinue(message); break;
      case 'favorite': onFavorite(message); break;
      case 'export': onExport(message); break;
    }
  };

  // Only show for assistant messages (for now — user messages have simpler actions)
  const visibleActions = message.role === 'user'
    ? ACTIONS.filter(a => ['copy', 'edit'].includes(a.id))
    : ACTIONS;

  return (
    <div
      className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      style={{ minHeight: 22 }}
    >
      {visibleActions.map(action => (
        <button
          key={action.id}
          onClick={() => handleAction(action.id)}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer border-none transition-all duration-100"
          style={{
            background: 'transparent',
            color: 'var(--text-tertiary)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          title={action.label + (action.shortcut ? ` (${action.shortcut})` : '')}
        >
          <action.icon cop color='currentColor' />
          {copied && action.id === 'copy' ? '已复制!' : action.label}
          {action.shortcut && (
            <span className="ml-0.5 text-[9px] opacity-50" style={{ fontFamily: 'var(--font-mono)' }}>
              {action.shortcut}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Icon Components ──
function CopyIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="4.5" width="8" height="8" rx="1.5"/>
      <path d="M2.5 9.5V3a1 1 0 0 1 1-1h6.5"/>
    </svg>
  );
}
function RetryIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 6V2l4 4-4 4V6z"/>
      <path d="M3 6a5.5 5.5 0 1 0 1.6-3.9"/>
    </svg>
  );
}
function EditIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2l2 2-8 8H2v-2l8-8z"/>
    </svg>
  );
}
function ContinueIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M5 3h.01M5 7h.01M2 7h10M8 4l4 3-4 3"/>
    </svg>
  );
}
function StarIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 1.5l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.6 3.4 12.5l.7-4-2.9-2.8 4-.6L7 1.5z"/>
    </svg>
  );
}
function ExportIcon({ color }: { color: string }) {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
      <path d="M7 1.5v8M4 4.5l3-3 3 3M2 9.5v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2"/>
    </svg>
  );
}
