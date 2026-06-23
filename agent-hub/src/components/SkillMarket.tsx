import { useState } from 'react';
import { useSkillRegistry } from '../hooks/useSkillRegistry';

const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  search:       { label: '搜索',   icon: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z' },
  file:         { label: '文件',   icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
  code:         { label: '代码',   icon: 'M16 18l6-6-6-6M8 6l-6 6 6 6' },
  media:        { label: '媒体',   icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  productivity: { label: '工具',   icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z' },
  custom:       { label: '自定义', icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
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
        {/* 标题区 */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg blur-md opacity-30"
                style={{ background: 'linear-gradient(135deg, var(--accent), #10B981)' }} />
              <div className="relative w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #10B981)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                  <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                插件管理
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {skills.length} 个插件 · 开关即时生效 · 无需重启
              </p>
            </div>
            {activeCount > 0 && (
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.25)' }}>
                <span className="relative">
                  <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: 'var(--success)' }} />
                  <span className="relative block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
                </span>
                {activeCount} 已启用
              </div>
            )}
          </div>
        </div>

        {/* 分类筛选 */}
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
              {cat === 'All' ? '全部' : CATEGORY_MAP[cat]?.label || cat}
              {cat === 'All' && (
                <span className="text-[10px] opacity-60">({skills.length})</span>
              )}
            </button>
          ))}
        </div>

        {/* 插件卡片列表 */}
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
                onMouseEnter={e => { if (!active) e.currentTarget.style.opacity = '0.8'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.opacity = '0.5'; }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                    style={{
                      background: active ? 'linear-gradient(135deg, #7C3AED, #8B5CF6)' : 'var(--bg-tertiary)',
                      boxShadow: active ? '0 0 16px rgba(139, 92, 246, 0.25)' : 'none',
                    }}>
                    <span className="text-lg select-none">{skill.icon}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold truncate" style={{ fontFamily: 'var(--font-body)', color: 'var(--text-primary)' }}>
                        {skill.name}
                      </h3>
                      {/* 开关 */}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSkill(skill.id); }}
                        className="relative w-10 h-5.5 rounded-full transition-all duration-300 shrink-0"
                        style={{
                          background: active
                            ? 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
                            : 'var(--border-default)',
                        }}>
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
                          需要密钥
                        </span>
                      )}
                      {skill.parameters.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                          {skill.parameters.length} 个参数
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 空状态 */}
        {filtered.length === 0 && (
          <div className="py-20 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-tertiary)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round">
                <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>该分类暂无插件</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>后续版本将持续添加</p>
          </div>
        )}
      </div>
    </div>
  );
}
