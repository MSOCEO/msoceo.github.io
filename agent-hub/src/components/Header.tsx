import { useState, useEffect } from 'react';

interface HeaderProps {
  webgpu: boolean;
  onOpenStore: () => void;
  onOpenSkills: () => void;
}

export default function Header({ webgpu, onOpenStore, onOpenSkills }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center justify-between px-8 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(6, 10, 16, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      }}
    >
      {/* Logo */}
      <a href="#" className="flex items-center gap-3 no-underline group">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, var(--accent), var(--cyan))',
            boxShadow: '0 0 16px rgba(0, 212, 255, 0.2)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
            <path d="M5.64 5.64l2.83 2.83m7.07 7.07l2.83 2.83M5.64 18.36l2.83-2.83m7.07-7.07l2.83-2.83"/>
          </svg>
        </div>
        <span
          className="text-[17px] tracking-tight transition-all duration-300"
          style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}
        >
          聚合控制台
        </span>
      </a>

      {/* Nav */}
      <nav className="flex items-center gap-1">
        {[
          { label: '模型商店', onClick: onOpenStore },
          { label: '技能中心', onClick: onOpenSkills },
        ].map((item) => (
          <button
            key={item.label}
            onClick={item.onClick}
            className="px-4 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 border-none cursor-pointer"
            style={{
              color: 'var(--text-secondary)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-primary)';
              e.currentTarget.style.background = 'var(--bg-card)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {item.label}
          </button>
        ))}

        {/* WebGPU Status */}
        <div
          className="ml-3 flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300"
          style={{
            borderColor: webgpu ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255,255,255,0.08)',
            background: webgpu ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255,255,255,0.02)',
          }}
        >
          <span
            className="relative flex h-2 w-2"
            style={{ animation: webgpu ? 'dot-pulse 2s ease-in-out infinite' : 'none' }}
          >
            <span
              className="absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{
                background: webgpu ? 'var(--success)' : 'var(--text-tertiary)',
                animation: webgpu ? 'none' : 'none',
              }}
            />
          </span>
          <span
            className="text-[12px] font-medium"
            style={{ color: webgpu ? 'var(--success)' : 'var(--text-tertiary)' }}
          >
            {webgpu ? 'GPU 就绪' : 'GPU 未检测'}
          </span>
        </div>
      </nav>
    </header>
  );
}
