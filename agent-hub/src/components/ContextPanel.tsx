import { useState, useEffect, useRef } from 'react';
import type { AgentConfig, ModelLoadState, SkillDefinition } from '../types';

interface ContextPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  activeAgent: AgentConfig;
  currentModelName: string;
  loadState: ModelLoadState;
  activeSkills: SkillDefinition[];
  messageCount: number;
  totalTokens: number;
  temperature: number;
  maxTokens: number;
  thinkingMode: boolean;
}

/** Circular progress ring SVG */
function RingProgress({ pct, color, size = 56, strokeWidth = 4 }: { pct: number; color: string; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s var(--ease-out)' }}
        />
      </svg>
      <span className="absolute text-[12px] font-semibold" style={{ color: 'var(--text-primary)' }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export default function ContextPanel({
  isOpen, onToggle, activeAgent, currentModelName, loadState,
  activeSkills, messageCount, totalTokens, temperature, maxTokens, thinkingMode,
}: ContextPanelProps) {
  const [closing, setClosing] = useState(false);
  const panelRef = useRef<HTMLElement>(null);

  // Close animation
  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onToggle(); }, 300);
  };

  if (!isOpen && !closing) return null;

  const tokenUsagePct = maxTokens > 0 ? Math.min(100, (totalTokens / maxTokens) * 100) : 0;
  const contextUsedPct = Math.min(100, totalTokens > 0 ? Math.round((totalTokens / activeAgent.maxTokens) * 100) : 0);
  const tempPct = temperature * 100;

  return (
    <aside
      ref={panelRef}
      className="fixed right-0 top-[68px] bottom-0 z-20 flex flex-col overflow-y-auto transition-all duration-300"
      style={{
        width: 280,
        transform: closing ? 'translateX(100%)' : 'translateX(0)',
        opacity: closing ? 0 : 1,
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-subtle)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <span
          className="text-[12px] font-semibold tracking-wide uppercase"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text-tertiary)' }}
        >
          上下文面板
        </span>
        <button
          onClick={handleClose}
          className="w-6 h-6 rounded-md flex items-center justify-center cursor-pointer border-none transition-all duration-150"
          style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          title="折叠面板 (⌘/)"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M5 3l4.5 4-4.5 4"/>
          </svg>
        </button>
      </div>

      <div className="p-4 flex flex-col gap-5">

        {/* ── Session Stats ── */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-tertiary)' }}>
            会话统计
          </h3>
          <div
            className="flex items-center gap-4 p-3.5 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <RingProgress pct={contextUsedPct} color="var(--accent)" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>上下文用量</span>
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-accent)' }}>
                  {totalTokens.toLocaleString()} / {activeAgent.maxTokens.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>消息数</span>
                <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {messageCount}
                </span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${contextUsedPct}%`,
                    background: contextUsedPct > 80 ? 'var(--error)' : 'var(--accent)',
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Inference Params ── */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-tertiary)' }}>
            推理参数
          </h3>
          <div
            className="flex flex-col gap-3 p-3.5 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            {/* Temperature */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Temperature</span>
                <span className="text-[11px] font-mono font-medium" style={{ color: 'var(--text-accent)' }}>
                  {temperature.toFixed(1)}
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-elevated)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${tempPct}%`,
                    background: 'linear-gradient(90deg, var(--cyan), var(--accent))',
                  }}
                />
              </div>
            </div>
            {/* Top-P */}
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Top-P</span>
              <span className="text-[11px] font-mono font-medium" style={{ color: 'var(--text-primary)' }}>0.95</span>
            </div>
            {/* Max Tokens */}
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>Max Tokens</span>
              <span className="text-[11px] font-mono font-medium" style={{ color: 'var(--text-primary)' }}>
                {maxTokens.toLocaleString()}
              </span>
            </div>
            {/* Thinking */}
            <div className="flex items-center justify-between">
              <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>思考模式</span>
              <span
                className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: thinkingMode ? 'var(--thinking-bg)' : 'var(--bg-elevated)',
                  color: thinkingMode ? 'var(--thinking)' : 'var(--text-tertiary)',
                }}
              >
                {thinkingMode ? '⚡ 已启用' : '未启用'}
              </span>
            </div>
          </div>
        </section>

        {/* ── Active Agent ── */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-tertiary)' }}>
            当前 Agent
          </h3>
          <div
            className="flex items-center gap-3 p-3.5 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-[18px]"
              style={{ background: 'var(--accent-bg)' }}
            >
              {activeAgent.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] mb-0.5" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                {activeAgent.name}
              </div>
              <div className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                {activeAgent.description}
              </div>
            </div>
          </div>
        </section>

        {/* ── Active Skills ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
              活跃技能
            </h3>
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
              style={{ background: 'var(--accent-bg)', color: 'var(--text-accent)' }}
            >
              {activeSkills.length}
            </span>
          </div>
          <div
            className="flex flex-col gap-1.5 p-3.5 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            {activeSkills.length === 0 ? (
              <span className="text-[12px] text-center py-2" style={{ color: 'var(--text-tertiary)' }}>
                暂无活跃技能
              </span>
            ) : (
              activeSkills.map(s => (
                <div key={s.id} className="flex items-center gap-2.5 py-1.5">
                  <span className="text-[13px] flex-shrink-0">{s.icon}</span>
                  <span className="text-[12px] truncate" style={{ color: 'var(--text-secondary)' }}>
                    {s.name}
                  </span>
                  <div
                    className="w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0"
                    style={{ background: 'var(--success)' }}
                    title="已激活"
                  />
                </div>
              ))
            )}
          </div>
        </section>

        {/* ── Model Info ── */}
        <section>
          <h3 className="text-[11px] font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-tertiary)' }}>
            模型状态
          </h3>
          <div
            className="flex items-center gap-3 p-3.5 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{
                background: loadState.status === 'ready' ? 'var(--success)' : loadState.status === 'error' ? 'var(--error)' : 'var(--warning)',
              }}
            />
            <span className="text-[13px] truncate" style={{ color: 'var(--text-primary)' }}>
              {loadState.status === 'ready' ? currentModelName : '未加载'}
            </span>
          </div>
        </section>
      </div>
    </aside>
  );
}
