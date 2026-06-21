// ============================================================
// Agent Hub - Skill Marketplace
// ============================================================

import { useState } from 'react';
import type { SkillDefinition } from '../types';
import { useSkillRegistry } from '../hooks/useSkillRegistry';

interface SkillMarketProps {
  skillReg: ReturnType<typeof useSkillRegistry>;
}

export function SkillMarket({ skillReg }: SkillMarketProps) {
  const [addingCustom, setAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  const handleAddCustom = async () => {
    if (!customName.trim() || !customDesc.trim()) return;
    const id = 'custom-' + Date.now();
    const skill: SkillDefinition = {
      id,
      name: customName,
      description: customDesc,
      icon: '🧩',
      category: 'custom',
      isBuiltin: false,
      parameters: [],
      execute: 'async () => JSON.stringify({ message: "Hello from custom skill!" })',
    };
    await skillReg.installSkill(skill);
    setCustomName('');
    setCustomDesc('');
    setAddingCustom(false);
  };

  const categories = [
    { key: 'all', label: '全部' },
    { key: 'search', label: '搜索' },
    { key: 'productivity', label: '效率' },
    { key: 'code', label: '代码' },
    { key: 'media', label: '媒体' },
    { key: 'custom', label: '自定义' },
  ] as const;
  const [activeCat, setActiveCat] = useState<string>('all');

  const filtered = activeCat === 'all'
    ? skillReg.skills
    : skillReg.skills.filter(s => s.category === activeCat);

  return (
    <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">插件市场</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            安装和管理 AI Agent 可调用的工具插件
          </p>
        </div>
        <button
          onClick={() => setAddingCustom(!addingCustom)}
          className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
        >
          + 添加插件
        </button>
      </div>

      {/* Custom Skill Form */}
      {addingCustom && (
        <div className="mb-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] animate-fade-in">
          <div className="flex gap-3">
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              placeholder="插件名称"
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50"
            />
            <button
              onClick={handleAddCustom}
              className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90"
            >
              确认
            </button>
            <button
              onClick={() => setAddingCustom(false)}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              取消
            </button>
          </div>
          <input
            type="text"
            value={customDesc}
            onChange={e => setCustomDesc(e.target.value)}
            placeholder="插件描述"
            className="w-full mt-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50"
          />
          <p className="text-[10px] text-[var(--text-muted)] mt-1.5">
            自定义插件默认为空壳，后续可在浏览器 DevTools 中编辑 execute 函数
          </p>
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex gap-1 mb-4">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCat(cat.key)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              activeCat === cat.key
                ? 'bg-[var(--accent-bg)] text-[var(--accent-light)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Skill Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(skill => (
          <SkillCard
            key={skill.id}
            skill={skill}
            isActive={skillReg.activeSkills.includes(skill.id)}
            onToggle={() => skillReg.toggleSkill(skill.id)}
            onRemove={skill.isBuiltin ? undefined : () => skillReg.removeSkill(skill.id)}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="mt-6 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border)]">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            已启用 <span className="font-medium text-[var(--text-primary)]">{skillReg.activeSkills.length}</span> / {skillReg.skills.length} 个插件
          </span>
          <div className="flex gap-2">
            <button
              onClick={skillReg.enableAllSkills}
              className="text-[11px] text-[var(--accent-light)] hover:underline"
            >
              全部启用
            </button>
            <button
              onClick={skillReg.disableAllSkills}
              className="text-[11px] text-[var(--text-muted)] hover:underline"
            >
              全部禁用
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillCard({ skill, isActive, onToggle, onRemove }: {
  skill: SkillDefinition;
  isActive: boolean;
  onToggle: () => void;
  onRemove?: () => void;
}) {
  return (
    <div className={`p-4 rounded-xl border transition-all ${
      isActive
        ? 'border-[var(--accent)]/50 bg-[var(--accent-bg)]'
        : 'border-[var(--border)] bg-[var(--bg-card)]'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{skill.icon}</span>
          <div>
            <p className="font-medium text-sm">{skill.name}</p>
            <p className="text-[11px] text-[var(--text-muted)]">
              {skill.isBuiltin ? '内置' : '自定义'} · {skill.parameters.length} 参数
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggle}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              isActive ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'
            }`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
              isActive ? 'translate-x-[18px]' : 'translate-x-[1px]'
            }`} />
          </button>
          {onRemove && (
            <button
              onClick={onRemove}
              className="w-5 h-5 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--error)] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-2.5 leading-relaxed">{skill.description}</p>
      {skill.parameters.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1">
          {skill.parameters.map(p => (
            <span key={p.name} className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[10px] text-[var(--text-muted)]">
              {p.name}: {p.type}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
