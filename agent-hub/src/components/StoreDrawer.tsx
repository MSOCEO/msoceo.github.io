import { useState, useEffect } from 'react';
import { useToolRegistry } from '../hooks/useToolRegistry';
import { useSkillRegistry } from '../hooks/useSkillRegistry';
import { TOOL_CATALOG, CATEGORY_INFO } from '../lib/tools';
import { MODEL_REGISTRY } from '../lib/models';
import { EXTERNAL_MODELS } from '../lib/external-models';
import type { ToolDefinition } from '../types';

type Tab = 'tools' | 'models' | 'skills';

interface StoreDrawerProps {
  open: boolean;
  initialTab?: Tab;
  onClose: () => void;
}

export function StoreDrawer({ open, initialTab = 'tools', onClose }: StoreDrawerProps) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const toolReg = useToolRegistry();
  const skillReg = useSkillRegistry();

  useEffect(() => { setTab(initialTab); setSearch(''); setSelectedCat('all'); }, [initialTab, open]);
  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden'; }
    else { document.body.style.overflow = ''; }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const filteredTools = TOOL_CATALOG.filter(t => {
    if (selectedCat !== 'all' && t.category !== selectedCat) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const categories = ['all', ...Array.from(new Set(TOOL_CATALOG.map(t => t.category)))];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-[480px] max-w-[90vw] z-50 flex flex-col animate-slide-up"
        style={{
          background: 'var(--bg-primary)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-deep), var(--accent))' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <span className="font-semibold text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              {tab === 'tools' ? '工具商店' : tab === 'models' ? '模型中心' : '技能管理'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex flex-shrink-0 px-5 py-3 gap-2">
          {[
            { id: 'tools' as Tab, label: '🛠️ 工具商店', desc: '安装 AI 工具' },
            { id: 'models' as Tab, label: '🧠 模型中心', desc: '浏览模型' },
            { id: 'skills' as Tab, label: '⚡ 技能管理', desc: '对话技能' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-center"
              style={{
                background: tab === t.id ? 'var(--bg-tertiary)' : 'transparent',
                color: tab === t.id ? 'var(--text-primary)' : 'var(--text-muted)',
                border: tab === t.id ? '1px solid var(--border-default)' : '1px solid transparent',
              }}
            >
              <div className="text-xs mb-0.5">{t.label.split(' ')[0]}</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{t.desc}</div>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-2 min-h-0">

          {/* === Tools Tab === */}
          {tab === 'tools' && (
            <>
              {/* Search */}
              <div className="mb-3">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索工具..."
                  className="w-full px-3.5 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-body)',
                  }}
                />
              </div>
              {/* Category filter */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCat(cat)}
                    className="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
                    style={{
                      background: selectedCat === cat ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                      color: selectedCat === cat ? 'var(--accent-light)' : 'var(--text-muted)',
                      border: selectedCat === cat ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    {cat === 'all' ? '全部' : CATEGORY_INFO[cat]?.label || cat}
                  </button>
                ))}
              </div>
              {/* Tool list */}
              <div className="space-y-2 mb-6">
                {filteredTools.map(tool => {
                  const installed = toolReg.installed.find(i => i.toolId === tool.id);
                  return (
                    <div key={tool.id}
                      className="flex items-start gap-3 p-3.5 rounded-xl transition-all duration-200 hover-lift"
                      style={{
                        background: installed ? 'var(--accent-bg)' : 'var(--bg-secondary)',
                        border: installed ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                      }}
                    >
                      <span className="text-2xl flex-shrink-0 mt-0.5">{tool.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{tool.name}</span>
                          {tool.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full"
                              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{tool.description}</p>
                        <div className="flex items-center gap-2">
                          {tool.size && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>📦 {tool.size}</span>}
                          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                            {tool.requiresLocal ? '🔧 需本地安装' : '☁️ 云端服务'}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => installed ? toolReg.uninstall(tool.id) : toolReg.install(tool.id)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 flex-shrink-0 hover:scale-105"
                        style={{
                          background: installed ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent-deep), var(--accent))',
                          color: installed ? 'var(--text-secondary)' : 'white',
                          border: installed ? '1px solid var(--border-subtle)' : 'none',
                        }}
                      >
                        {installed ? '已安装' : '安装'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* === Models Tab === */}
          {tab === 'models' && (
            <div className="space-y-4">
              {/* WebLLM Models */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>🧠 本地 WebLLM 模型</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
                    浏览器内运行
                  </span>
                </div>
                <div className="space-y-2">
                  {MODEL_REGISTRY.map(m => (
                    <div key={m.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}
                    >
                      <span className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>
                        {m.provider[0]}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{m.name}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.size} · 上下文 {m.contextLength >= 1024 ? `${m.contextLength / 1024}K` : m.contextLength}</div>
                      </div>
                      <div className="flex gap-1">
                        {m.tags.map(t => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full"
                            style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* External Models */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>🔌 外部模型</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                    需安装对应工具
                  </span>
                </div>
                <div className="space-y-2">
                  {EXTERNAL_MODELS.map(m => {
                    const neededTools = m.requires.filter(rid => toolReg.installed.find(i => i.toolId === rid));
                    const allReady = m.requires.length > 0 && neededTools.length === m.requires.length;
                    return (
                      <div key={m.id}
                        className="flex items-center gap-3 p-3 rounded-xl"
                        style={{
                          background: allReady ? 'var(--accent-bg)' : 'var(--bg-secondary)',
                          border: allReady ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                        }}
                      >
                        <span className="text-xl flex-shrink-0">{m.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{m.name}</div>
                          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.provider} · {m.description}</div>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full ${
                          allReady ? '' : ''
                        }`}
                          style={{
                            background: allReady ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                            color: allReady ? 'var(--success)' : 'var(--text-muted)',
                          }}
                        >
                          {allReady ? '✅ 可用' : `${neededTools.length}/${m.requires.length} 工具`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* === Skills Tab === */}
          {tab === 'skills' && (
            <div className="space-y-2">
              <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
                在对话中启用技能后，AI 可以调用这些功能来增强回答。点击切换开关即可启用/禁用。
              </p>
              {skillReg.skills.map(skill => {
                const active = skillReg.activeSkills.includes(skill.id);
                return (
                  <div key={skill.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                    style={{
                      background: active ? 'var(--accent-bg)' : 'var(--bg-secondary)',
                      border: active ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                    }}
                  >
                    <span className="text-xl flex-shrink-0">{skill.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{skill.name}</span>
                        {skill.isBuiltin && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>内置</span>
                        )}
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{skill.description}</p>
                    </div>
                    <button
                      onClick={() => skillReg.toggleSkill(skill.id)}
                      className={`w-10 h-5 rounded-full relative transition-colors duration-200 flex-shrink-0`}
                      style={{ background: active ? 'var(--accent)' : 'var(--border-default)' }}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200"
                        style={{ left: active ? '22px' : '2px' }}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
