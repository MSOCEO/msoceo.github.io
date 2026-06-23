import { useState } from 'react';
import { useToolRegistry } from '../hooks/useToolRegistry';
import { TOOL_CATALOG, CATEGORY_INFO } from '../lib/tools';
import type { ToolDefinition } from '../types';

const allCats = ['All', ...Object.keys(CATEGORY_INFO)];

export default function ToolStore() {
  const { install, uninstall, isInstalled } = useToolRegistry();
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');
  const [installing, setInstalling] = useState<string | null>(null);

  const filtered = TOOL_CATALOG.filter(t => {
    if (filterCat !== 'All' && t.category !== filterCat) return false;
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.includes(search)) return false;
    return true;
  });

  const handleInstall = async (tool: ToolDefinition) => {
    setInstalling(tool.id);
    await install(tool.id);
    setInstalling(null);
  };

  const handleUninstall = async (tool: ToolDefinition) => {
    setInstalling(tool.id);
    await uninstall(tool.id);
    setInstalling(null);
  };

  return (
    <div className="h-full overflow-y-auto animate-view-enter">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                App Store
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {TOOL_CATALOG.length} 个工具 · 一键安装到控制台 · 无需跳转
              </p>
            </div>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="搜索工具..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allCats.map(cat => {
              const info = CATEGORY_INFO[cat];
              const active = filterCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-1.5 shrink-0"
                  style={{
                    background: active ? (info?.color ? `${info.color}15` : 'var(--accent-bg)') : 'var(--bg-tertiary)',
                    color: active ? (info?.color || 'var(--accent-light)') : 'var(--text-muted)',
                    border: active ? `1px solid ${info?.color || 'var(--border-accent)'}40` : '1px solid transparent',
                  }}
                >
                  {cat === 'All' ? '全部' : <><span>{info?.icon}</span> {info?.label}</>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool cards */}
        {filtered.length === 0 ? (
          <div className="py-20 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-tertiary)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>没有匹配的工具</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((tool, i) => {
              const installed = isInstalled(tool.id);
              const busy = installing === tool.id;
              const info = CATEGORY_INFO[tool.category];

              return (
                <div
                  key={tool.id}
                  className="rounded-2xl p-4 transition-all duration-300 animate-fade-in-scale group"
                  style={{
                    background: installed ? 'var(--bg-card)' : 'var(--bg-primary)',
                    border: installed ? '1px solid var(--border-subtle)' : '1px solid var(--border-subtle)',
                    boxShadow: installed ? 'var(--shadow-sm)' : 'none',
                    animationDelay: `${i * 0.04}s`,
                  }}
                >
                  {/* Icon + Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                      style={{ background: installed ? `${info?.color || '#8B5CF6'}20` : 'var(--bg-tertiary)' }}>
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {tool.name}
                      </h3>
                      <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        {tool.requiresLocal ? '需本地部署' : '云端服务'}
                        {tool.size ? ` · ${tool.size}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {tool.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ background: `${info?.color || '#8B5CF6'}18`, color: info?.color || '#8B5CF6' }}>
                      {info?.label}
                    </span>
                    {tool.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {installed ? (
                      <>
                        <a
                          href={tool.cloudUrl || tool.defaultUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 text-center py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                          style={{
                            background: 'linear-gradient(135deg, #10B981, #059669)',
                            color: '#fff',
                          }}
                        >
                          打开
                        </a>
                        <button
                          onClick={() => handleUninstall(tool)}
                          disabled={busy}
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                          style={{ background: 'var(--error-bg)', color: 'var(--error)' }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleInstall(tool)}
                          disabled={busy}
                          className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                          style={{
                            background: 'linear-gradient(135deg, var(--accent-deep), var(--accent))',
                            color: '#fff',
                            opacity: busy ? 0.6 : 1,
                          }}
                        >
                          {busy ? '安装中...' : '安装到控制台'}
                        </button>
                        <a
                          href={tool.docsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                          title="查看文档"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                            <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                          </svg>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
