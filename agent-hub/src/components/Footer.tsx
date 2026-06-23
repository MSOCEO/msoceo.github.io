export default function Footer() {
  return (
    <footer className="relative py-12 px-6">
      <div className="divider max-w-5xl mx-auto mb-10" />
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--cyan))' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
            </svg>
          </div>
          <span
            className="text-[14px] tracking-tight"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 500, color: 'var(--text-primary)' }}
          >
            聚合控制台
          </span>
        </div>
        <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
          本地运行 · 零数据泄漏 · 基于 WebGPU & WebLLM
        </p>
      </div>
    </footer>
  );
}
