import { useState, useEffect } from 'react';
import { MODEL_REGISTRY } from '../lib/models';
import { BUILTIN_SKILLS } from '../lib/skills';
import { TOOL_CATALOG } from '../lib/tools';
import { EXTERNAL_MODELS } from '../lib/external-models';

interface StoreDrawerProps {
  open: boolean;
  initialTab?: string;
  onClose: () => void;
}

const TABS = [
  { id: 'tools', label: '工具商店', icon: '🔧' },
  { id: 'models', label: '模型中心', icon: '🧠' },
  { id: 'skills', label: '技能管理', icon: '⚡' },
];

export default function StoreDrawer({ open, initialTab, onClose }: StoreDrawerProps) {
  const [tab, setTab] = useState(initialTab || 'tools');
  const [closing, setClosing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (open) { setClosing(false); document.body.style.overflow = 'hidden'; }
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 300);
  };

  if (!open && !closing) return null;

  const categories = [...new Set(TOOL_CATALOG.map(t => t.category))];
  const filteredTools = TOOL_CATALOG.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false;
    if (search && !t.name.includes(search) && !t.description.includes(search)) return false;
    return true;
  });

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-50 transition-all duration-300"
        style={{ background: closing ? 'transparent' : 'rgba(0,0,0,0.5)', backdropFilter: closing ? 'none' : 'blur(4px)' }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-all duration-300 ease-out"
        style={{
          width: 460,
          transform: closing ? 'translateX(100%)' : 'translateX(0)',
          background: 'rgba(8, 14, 24, 0.97)',
          backdropFilter: 'blur(30px)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="text-[17px] m-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}>
            资源中心
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all duration-200"
            style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l10 10M12 2l-10 10"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
              style={{
                background: tab === t.id ? 'var(--accent-bg)' : 'transparent',
                color: tab === t.id ? 'var(--text-accent)' : 'var(--text-tertiary)',
              }}
            >
              <span style={{ marginRight: 4 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ─── Tab: Tools ─── */}
          {tab === 'tools' && (
            <>
              {/* Search */}
              <input
                type="text"
                placeholder="搜索工具…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-[13px] mb-4 outline-none border transition-all duration-200"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-subtle)',
                  fontFamily: 'var(--font-body)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              />

              {/* Category filter */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                <button
                  onClick={() => setFilter('all')}
                  className="px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer border-none transition-all duration-200"
                  style={{ background: filter === 'all' ? 'var(--accent-bg)' : 'var(--bg-card)', color: filter === 'all' ? 'var(--text-accent)' : 'var(--text-tertiary)' }}
                >
                  全部
                </button>
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className="px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer border-none transition-all duration-200"
                    style={{ background: filter === c ? 'var(--accent-bg)' : 'var(--bg-card)', color: filter === c ? 'var(--text-accent)' : 'var(--text-tertiary)' }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Tool list */}
              <div className="flex flex-col gap-2">
                {filteredTools.map(tool => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[18px]"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] mb-0.5" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {tool.name}
                      </div>
                      <div className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {tool.description}
                      </div>
                    </div>
                    <button
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer border-none transition-all duration-200"
                      style={{ background: 'var(--accent-bg)', color: 'var(--text-accent)' }}
                    >
                      安装
                    </button>
                  </div>
                ))}
                {filteredTools.length === 0 && (
                  <div className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
                    <p className="text-[13px]">未找到匹配的工具</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ─── Tab: Models ─── */}
          {tab === 'models' && (
            <div className="flex flex-col gap-6">
              <div>
                <h4 className="text-[14px] mb-3" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  本地模型 (WebLLM)
                </h4>
                <div className="flex flex-col gap-2">
                  {MODEL_REGISTRY.map(m => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px]" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>{m.size}</span>
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{m.provider} · {m.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[14px] mb-3" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  外部模型
                </h4>
                <div className="flex flex-col gap-2">
                  {EXTERNAL_MODELS.map(m => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px]" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>{m.provider}</span>
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{m.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab: Skills ─── */}
          {tab === 'skills' && (
            <div className="flex flex-col gap-2">
              {BUILTIN_SKILLS.map(skill => (
                <div
                  key={skill.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[18px]"
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    {skill.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] mb-0.5" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {skill.name}
                    </div>
                    <div className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {skill.description}
                    </div>
                  </div>
                  <div
                    className="w-9 h-5 rounded-full relative cursor-pointer transition-all duration-300"
                    style={{ background: 'var(--accent)' }}
                    onClick={() => {}}
                  >
                    <div
                      className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300"
                      style={{ left: '18px' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
