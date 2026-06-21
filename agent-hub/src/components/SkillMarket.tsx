import { useState } from 'react';
import { useSkillRegistry } from '../hooks/useSkillRegistry';

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  search: { label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z' },
  file: { label: 'File', icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
  code: { label: 'Code', icon: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
  media: { label: 'Media', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  productivity: { label: 'Tools', icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z' },
  custom: { label: 'Custom', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
};

export default function SkillMarket() {
  const { skills, activeSkills, toggleSkill } = useSkillRegistry();
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', ...new Set(skills.map(s => s.category))];
  const filtered = filter === 'All' ? skills : skills.filter(s => s.category === filter);
  const activeCount = activeSkills.length;

  return (
    <div className="h-full overflow-y-auto animate-view-enter">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--accent-deep), var(--accent))' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Skill Plugins
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {skills.length} plugins · Toggle on/off — no restart needed
              </p>
            </div>
            {activeCount > 0 && (
              <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)', border: '1px solid var(--border-accent)' }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                {activeCount} active
              </div>
            )}
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1.5 mb-6 animate-slide-up stagger-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="text-xs px-3 py-1.5 rounded-xl font-medium transition-all duration-200 flex items-center gap-1.5"
              style={{
                background: filter === cat ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                color: filter === cat ? 'var(--accent-light)' : 'var(--text-muted)',
                border: filter === cat ? '1px solid var(--border-accent)' : '1px solid transparent',
              }}
            >
              {cat === 'All' ? 'All' : CATEGORY_MAP[cat]?.label || cat}
              {cat === 'All' && (
                <span className="text-[10px] opacity-60">({skills.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* Skills grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((skill, i) => {
            const active = activeSkills.includes(skill.id);
            const cat = CATEGORY_MAP[skill.category] || { label: skill.category, icon: '' };

            return (
              <div
                key={skill.id}
                className="rounded-2xl p-4 transition-all duration-300 animate-fade-in-scale group"
                style={{
                  background: active ? 'var(--bg-card)' : 'var(--bg-primary)',
                  border: active ? '1px solid var(--border-subtle)' : '1px solid var(--border-subtle)',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  animationDelay: `${i * 0.04}s`,
                  opacity: active ? 1 : 0.5,
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.opacity = '0.5';
                }}
              >
                {/* Card header */}
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                    style={{
                      background: active
                        ? 'linear-gradient(135deg, var(--accent-deep), var(--accent))'
                        : 'var(--bg-tertiary)',
                      boxShadow: active ? '0 0 16px rgba(139, 92, 246, 0.25)' : 'none',
                    }}>
                    <span className="text-lg select-none">{skill.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
                        {skill.name}
                      </h3>
                      {/* Toggle */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSkill(skill.id); }}
                        className="relative w-10 h-5.5 rounded-full transition-all duration-300 shrink-0"
                        style={{
                          background: active
                            ? 'linear-gradient(135deg, var(--accent), var(--accent-deep))'
                            : 'var(--border-default)',
                        }}
                      >
                        <span
                          className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                          style={{
                            left: active ? 'calc(100% - 18px)' : '2px',
                            transition: 'left 0.25s var(--ease-spring)',
                          }}
                        />
                      </button>
                    </div>

                    <p className="text-xs mt-1.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {skill.description}
                    </p>

                    {/* Bottom row */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background: active ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                          color: active ? 'var(--accent-light)' : 'var(--text-muted)',
                        }}>
                        {cat.label}
                      </span>
                      {skill.requiresApiKey && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
                          API Key
                        </span>
                      )}
                      {skill.parameters.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                          {skill.parameters.length} {skill.parameters.length === 1 ? 'param' : 'params'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="py-16 text-center animate-fade-in">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-tertiary)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              No plugins in this category
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
