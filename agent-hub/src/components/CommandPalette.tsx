import { useEffect, useState } from 'react';

interface Shortcut {
  keys: string;
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  { keys: '⌘ + Enter', description: '发送消息', category: '对话' },
  { keys: '⌘ + K', description: '显示/隐藏命令面板', category: '全局' },
  { keys: '⌘ + /', description: '切换右侧上下文面板', category: '面板' },
  { keys: '⌘ + B', description: '切换左侧会话侧栏', category: '面板' },
  { keys: 'Esc', description: '停止生成 / 关闭面板', category: '全局' },
  { keys: 'Shift + Enter', description: '换行', category: '对话' },
  { keys: '↑ / ↓', description: '浏览历史消息 / 命令选项', category: '导航' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleSessionList: () => void;
  onToggleContextPanel: () => void;
}

export default function CommandPalette({
  isOpen, onClose, onToggleSessionList, onToggleContextPanel,
}: CommandPaletteProps) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setClosing(false);
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { handleClose(); return; }
      if ((e.metaKey || e.ctrlKey)) {
        if (e.key === 'k') { e.preventDefault(); handleClose(); }
        if (e.key === 'b') { e.preventDefault(); onToggleSessionList(); handleClose(); }
        if (e.key === '/') { e.preventDefault(); onToggleContextPanel(); handleClose(); }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 200);
  };

  if (!isOpen && !closing) return null;

  const categories = [...new Set(SHORTCUTS.map(s => s.category))];

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-[60] transition-all duration-200"
        style={{
          background: closing ? 'transparent' : 'rgba(0,0,0,0.6)',
          backdropFilter: closing ? 'none' : 'blur(8px)',
        }}
      />

      {/* Panel */}
      <div
        className="fixed top-[25%] left-1/2 -translate-x-1/2 z-[61] w-[480px] max-w-[92vw] rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: 'rgba(15, 25, 45, 0.96)',
          backdropFilter: 'blur(30px)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(0,102,255,0.08)',
          transform: closing ? 'translate(-50%, -10px)' : 'translate(-50%, 0)',
          opacity: closing ? 0 : 1,
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.2), rgba(0,212,255,0.1))', boxShadow: '0 0 16px rgba(0,102,255,0.15)' }}
          >
            <span className="text-[14px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 700 }}>⌘</span>
          </div>
          <div>
            <h3
              className="text-[15px]"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}
            >
              快捷键总览
            </h3>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              按 Esc 关闭 · 在此面板内快捷键仍然生效
            </p>
          </div>
          <button
            onClick={handleClose}
            className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none"
            style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l10 10M12 2l-10 10"/>
            </svg>
          </button>
        </div>

        {/* Shortcuts */}
        <div className="p-4">
          {categories.map(cat => (
            <div key={cat} className="mb-4 last:mb-0">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest mb-2.5 px-1" style={{ color: 'var(--text-tertiary)' }}>
                {cat}
              </h4>
              <div className="flex flex-col gap-1">
                {SHORTCUTS.filter(s => s.category === cat).map(s => (
                  <div
                    key={s.keys}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ background: 'var(--bg-card)' }}
                  >
                    <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                      {s.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {s.keys.split(' + ').map((key, i, arr) => (
                        <span key={i} className="flex items-center">
                          <kbd
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium"
                            style={{
                              background: 'var(--bg-elevated)',
                              color: 'var(--text-primary)',
                              border: '1px solid var(--border-subtle)',
                              fontFamily: 'var(--font-mono)',
                            }}
                          >
                            {key}
                          </kbd>
                          {i < arr.length - 1 && (
                            <span className="text-[10px] mx-0.5" style={{ color: 'var(--text-tertiary)' }}>+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <div className="px-5 py-3 flex items-center gap-2" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }} />
          <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            在此面板内快捷键仍可触发操作
          </span>
        </div>
      </div>
    </>
  );
}
