interface HeroBrandProps {
  onDismiss: () => void;
  onExplore: () => void;
}

export default function HeroBrand({ onDismiss, onExplore }: HeroBrandProps) {
  return (
    <div className="relative flex-1 flex items-center justify-center overflow-hidden animate-view-enter"
      style={{ background: 'var(--bg-root)' }}>
      {/* 环境光背景 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--accent), transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--cyan), transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.03] blur-3xl"
          style={{ background: 'radial-gradient(circle, var(--accent-light), transparent 70%)' }} />
      </div>

      {/* 网格纹理 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

      {/* 内容 */}
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        {/* 版本标签 */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8 animate-fade-in"
          style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid var(--border-accent)',
          }}>
          <span className="w-2 h-2 rounded-full animate-pulse-dot" style={{ background: 'var(--success)' }} />
          <span className="text-xs font-medium" style={{ color: 'var(--accent-light)' }}>
            v4.0 · 聚合控制台
          </span>
        </div>

        {/* 主标题 */}
        <h1 className="text-[42px] leading-[1.05] font-bold tracking-[-0.03em] mb-5 animate-slide-up"
          style={{ fontFamily: 'var(--font-display)' }}>
          <span className="block" style={{ color: 'var(--text-primary)' }}>
            所有 AI 工具
          </span>
          <span className="block"
            style={{
              background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--cyan-light) 50%, var(--accent) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            一个控制台
          </span>
        </h1>

        <p className="text-base leading-relaxed mb-8 animate-slide-up stagger-1 max-w-xl mx-auto"
          style={{ color: 'var(--text-secondary)' }}>
          从 LLM 对话到文生图、图生 UI、代码 Agent — 所有 AI 工具汇聚于此。
          一键安装，本地运行，零数据泄漏。
        </p>

        {/* 特性 Bento 网格 */}
        <div className="grid grid-cols-3 gap-3 max-w-2xl mx-auto mb-10 animate-slide-up stagger-2">
          <BentoCard
            icon={<ShieldIcon />}
            title="100% 隐私"
            description="一切运行在本地浏览器，数据永不离开你的设备。"
          />
          <BentoCard
            icon={<ChipIcon />}
            title="6 个模型"
            description="从 Gemma 270M 到 Llama 8B，随时切换。"
          />
          <BentoCard
            icon={<BoltIcon />}
            title="WebGPU 加速"
            description="硬件加速推理，零云端延迟。"
          />
        </div>

        {/* 技术标签 */}
        <div className="flex items-center justify-center gap-3 animate-slide-up stagger-3">
          <Tag label="WebGPU" />
          <Tag label="IndexedDB 缓存" />
          <Tag label="Apache 2.0" />
          <Tag label="无需 API Key" />
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-3 mt-6 mb-10 animate-slide-up stagger-3">
          <button
            onClick={onExplore}
            className="px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 active:scale-95 relative overflow-hidden group"
            style={{ color: '#fff' }}>
            <div className="absolute inset-0 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #8B5CF6, #06B6D4)', backgroundSize: '200% 200%', animation: 'gradient-flow 3s ease infinite' }} />
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), transparent)' }} />
            <span className="relative z-10">进入控制台</span>
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

        {/* 关闭 */}
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

      {/* 底部渐变淡出 */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--bg-root), transparent)' }} />
    </div>
  );
}

function BentoCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-2xl p-4 text-center transition-all duration-300 hover:scale-[1.03] group"
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
