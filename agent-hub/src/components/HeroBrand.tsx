interface HeroBrandProps {
  onDismiss: () => void;
  onExplore: () => void;
}

export default function HeroBrand({ onDismiss, onExplore }: HeroBrandProps) {
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden animate-view-enter"
      style={{ background: 'var(--bg-root)' }}>
      {/* Ambient background gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-[0.06] blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--accent), transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-[0.05] blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--cyan), transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.03] blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--accent-light), transparent 70%)' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 animate-fade-in"
          style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid var(--border-accent)',
          }}>
          <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--success)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--accent-light)' }}>
            v4.0 · Aggregation Console
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-[42px] leading-[1.05] font-bold tracking-[-0.03em] mb-5 animate-slide-up"
          style={{ fontFamily: 'var(--font-display)' }}>
          <span className="block" style={{ color: 'var(--text-primary)' }}>
            All Your AI Tools.
          </span>
          <span className="block"
            style={{
              background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--cyan-light) 50%, var(--accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            One Console.
          </span>
        </h1>

        <p className="text-base leading-relaxed mb-8 animate-slide-up stagger-1 max-w-xl mx-auto"
          style={{ color: 'var(--text-secondary)' }}>
          从 LLM 对话到文生图、图生 UI、代码 Agent — 所有 AI 工具汇聚于此。
          一键安装，本地运行，零数据泄漏。
        </p>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto mb-10 animate-slide-up stagger-2">
          <BentoCard
            icon={<ShieldIcon />}
            title="100% Private"
            description="一切运行在本地浏览器，数据永不离开你的设备。"
          />
          <BentoCard
            icon={<ChipIcon />}
            title="6 Models"
            description="从 Gemma 3 270M 到 Llama 3.1 8B，随时切换。"
          />
          <BentoCard
            icon={<BoltIcon />}
            title="WebGPU Fast"
            description="硬件加速推理，零云端延迟。"
          />
        </div>

        {/* Tech Tags */}
        <div className="flex items-center justify-center gap-3 animate-slide-up stagger-3">
          <Tag label="WebGPU" />
          <Tag label="IndexedDB Cache" />
          <Tag label="Apache 2.0" />
          <Tag label="No API Keys" />
        </div>

        {/* CTA */}
        <div className="flex items-center justify-center gap-3 mb-10 animate-slide-up stagger-3">
          <button
            onClick={onExplore}
            className="px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, var(--accent-deep), var(--accent))',
              color: '#fff',
              boxShadow: '0 0 32px rgba(139, 92, 246, 0.35)',
            }}>
            进入控制台
          </button>
          <button
            onClick={onDismiss}
            className="px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 hover:bg-[var(--bg-tertiary)]"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
            }}>
            快速开始
          </button>
        </div>

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-[var(--bg-tertiary)]"
          style={{ color: 'var(--text-muted)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--bg-root), transparent)' }} />
    </div>
  );
}

function BentoCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl p-4 text-center transition-all duration-300 hover:scale-[1.02] group"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}>
      <div className="w-10 h-10 mx-auto mb-2.5 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:bg-[var(--accent-bg)]"
        style={{ background: 'var(--bg-tertiary)', color: 'var(--accent-light)' }}>
        {icon}
      </div>
      <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="text-[11px] px-2.5 py-1 rounded-full font-medium"
      style={{
        background: 'var(--accent-bg)',
        color: 'var(--accent-light)',
        border: '1px solid var(--border-accent)',
      }}>
      {label}
    </span>
  );
}

const ShieldIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const ChipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3"/>
  </svg>
);

const BoltIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);
