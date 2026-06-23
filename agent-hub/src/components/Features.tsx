const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
        <circle cx="12" cy="16" r="1"/>
      </svg>
    ),
    title: '100% 本地隐私',
    desc: '所有数据在浏览器内处理，不上传任何服务器。模型、对话、文件完全私有。',
    color: 'var(--accent)',
    bg: 'var(--accent-bg)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
    title: '6 款本地模型',
    desc: '内置 Qwen、Llama、Phi、Gemma 等主流开源模型，WebGPU 加速推理。',
    color: 'var(--cyan)',
    bg: 'var(--cyan-bg)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    title: 'GPU 硬件加速',
    desc: '利用 WebGPU 技术在浏览器中实现接近原生的 AI 推理速度，无需显卡驱动。',
    color: 'var(--thinking)',
    bg: 'var(--thinking-bg)',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
        <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12"/>
      </svg>
    ),
    title: '22+ 工具生态',
    desc: '文生图、图生 UI、代码 Agent、语音合成等工具即装即用，自由组合。',
    color: 'var(--success)',
    bg: 'var(--success-bg)',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-28 px-6 overflow-hidden">
      {/* Divider */}
      <div className="divider max-w-5xl mx-auto mb-20" />

      <div className="max-w-5xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2
            className="text-[36px] tracking-[-0.01em] mb-4"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}
          >
            为什么选择聚合控制台
          </h2>
          <p className="text-[16px] max-w-lg mx-auto" style={{ color: 'var(--text-secondary)' }}>
            不依赖任何云服务，让 AI 能力在您的设备上本地运行
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`glass glass-hover p-8 flex flex-col items-center text-center anim-fade-up delay-${i + 4}`}
              style={{ animationFillMode: 'both' }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300"
                style={{ background: f.bg, color: f.color }}
              >
                {f.icon}
              </div>
              <h3 className="text-[16px] mb-2" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {f.title}
              </h3>
              <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
