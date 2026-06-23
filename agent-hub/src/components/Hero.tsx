export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center pt-48 pb-32 px-6 overflow-hidden">
      {/* Glow orbs */}
      <div className="ambient-glow ambient-glow-blue" />
      <div className="ambient-glow ambient-glow-cyan" />

      {/* Badge */}
      <div
        className="anim-fade-up mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-[13px] font-medium"
        style={{
          borderColor: 'var(--border-accent)',
          background: 'var(--accent-bg)',
          color: 'var(--text-accent)',
        }}
      >
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: 'var(--accent)', animation: 'dot-pulse 2s ease-in-out infinite' }}
        />
        浏览器原生运行 · 零数据泄漏
      </div>

      {/* Title */}
      <h1
        className="anim-fade-up delay-1 max-w-3xl text-[64px] leading-[1.08] tracking-[-0.02em] mb-6"
        style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}
      >
        所有 AI 工具
        <br />
        <span
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          一个控制台
        </span>
      </h1>

      {/* Subtitle */}
      <p
        className="anim-fade-up delay-2 max-w-xl text-[18px] leading-relaxed mb-10"
        style={{ color: 'var(--text-secondary)' }}
      >
        在浏览器中加载大模型、安装工具插件、管理 AI 技能。
        <br />
        所有计算均在本地完成，无需服务器，无需 API Key。
      </p>

      {/* CTAs */}
      <div className="anim-fade-up delay-3 flex items-center gap-4">
        <a
          href="#workspace"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-[15px] font-semibold no-underline transition-all duration-300 hover-lift"
          style={{
            background: 'linear-gradient(135deg, var(--accent), #0080FF)',
            color: '#fff',
            boxShadow: '0 4px 20px rgba(0, 102, 255, 0.3)',
          }}
        >
          开始使用
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </a>
        <button
          className="px-7 py-3.5 rounded-xl text-[15px] font-medium border transition-all duration-300"
          style={{
            background: 'transparent',
            borderColor: 'var(--border-default)',
            color: 'var(--text-primary)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
            e.currentTarget.style.background = 'var(--bg-card)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-default)';
            e.currentTarget.style.background = 'transparent';
          }}
          onClick={() => {
            document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          了解更多
        </button>
      </div>

      {/* Scroll hint */}
      <div className="anim-fade-up delay-7 absolute bottom-8 flex flex-col items-center gap-2" style={{ color: 'var(--text-tertiary)' }}>
        <span className="text-[12px]">向下滚动</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ animation: 'float 2s ease-in-out infinite' }}>
          <path d="M3 5l4 4 4-4"/>
        </svg>
      </div>
    </section>
  );
}
