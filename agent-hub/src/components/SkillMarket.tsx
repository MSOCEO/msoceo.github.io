import { useState } from 'react';
import { useSkillRegistry } from '../hooks/useSkillRegistry';

const CATEGORY_MAP: Record<string, string> = {
  search: 'Search',
  file: 'File',
  code: 'Code',
  media: 'Media',
  productivity: 'Tools',
  custom: 'Custom',
};

const ICON_PATHS: Record<string, string> = {
  'web-search': 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z',
  'time-date': 'M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  'calculator': 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z',
  'weather': 'M3 15a4 4 0 0 0 4 4h9a5 5 0 1 0-.1-9.999 5.002 5.002 0 1 0-9.78 2.096A4.001 4.001 0 0 0 3 15z',
  'url-fetch': 'M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
  'code-runner': 'M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4',
};

export default function SkillMarket() {
  const { skills, activeSkills, toggleSkill } = useSkillRegistry();
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', ...new Set(skills.map(s => s.category))];
  const filtered = filter === 'All' ? skills : skills.filter(s => s.category === filter);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-lg font-bold tracking-tight animate-slide-up"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Skill Plugins
          </h2>
          <p className="text-sm mt-1 animate-slide-up stagger-1"
            style={{ color: 'var(--text-secondary)' }}>
            Modular tools the Agent can use. Toggle on/off — no restart needed.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5 mb-6 animate-slide-up stagger-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={{
                background: filter === cat ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
                color: filter === cat ? 'var(--accent-light)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)',
                border: filter === cat ? '1px solid var(--border-accent)' : '1px solid transparent',
              }}
            >
              {cat === 'All' ? 'All' : CATEGORY_MAP[cat] || cat}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((skill, i) => {
            const active = activeSkills.includes(skill.id);
            const iconPath = ICON_PATHS[skill.id] || 'M13 2L3 14h9l-1 8 10-12h-9l1-8z';

            return (
              <div
                key={skill.id}
                className="rounded-xl p-4 transition-all duration-200 animate-fade-in-scale"
                style={{
                  background: active ? 'var(--bg-card)' : 'var(--bg-primary)',
                  border: active ? '1px solid var(--border-subtle)' : '1px solid var(--border-subtle)',
                  boxShadow: active ? 'var(--shadow-sm)' : 'none',
                  animationDelay: `${i * 0.04}s`,
                  opacity: active ? 1 : 0.55,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: active ? 'var(--accent-bg)' : 'var(--bg-tertiary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke={active ? 'var(--accent-light)' : 'var(--text-muted)'}
                      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={iconPath} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium truncate"
                        style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
                        {skill.name}
                      </h3>
                      <button
                        onClick={() => toggleSkill(skill.id)}
                        className="flex-shrink-0 ml-2 relative w-9 h-5 rounded-full transition-all"
                        style={{ background: active ? 'var(--accent)' : 'var(--border-default)' }}
                      >
                        <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm"
                          style={{ left: active ? 'calc(100% - 18px)' : '2px', transition: 'left 0.2s var(--ease-spring)' }} />
                      </button>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      {skill.description}
                    </p>
                    <span className="inline-block text-[10px] mt-2 px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                      {CATEGORY_MAP[skill.category] || skill.category}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
