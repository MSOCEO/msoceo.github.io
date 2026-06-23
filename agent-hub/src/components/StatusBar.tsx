import { useEffect, useState } from 'react';

interface StatusBarProps {
  isGenerating: boolean;
  tokensPerSec: number;
  totalTokens: number;
  elapsedMs: number;
  onStop: () => void;
  hasError: boolean;
  errorMsg: string;
}

export default function StatusBar({
  isGenerating, tokensPerSec, totalTokens, elapsedMs,
  onStop, hasError, errorMsg,
}: StatusBarProps) {
  const [displayElapsed, setDisplayElapsed] = useState('0.0s');

  // Update elapsed time display
  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => {
      const sec = elapsedMs / 1000;
      setDisplayElapsed(sec >= 60
        ? `${Math.floor(sec / 60)}m ${Math.floor(sec % 60)}s`
        : `${sec.toFixed(1)}s`);
    }, 200);
    return () => clearInterval(interval);
  }, [isGenerating, elapsedMs]);

  return (
    <div
      className="flex items-center gap-3 px-2 py-1.5 text-[11px]"
      style={{
        borderTop: isGenerating ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
        background: isGenerating ? 'var(--accent-bg)' : 'transparent',
        transition: 'all 0.3s var(--ease-out)',
      }}
    >
      {/* Streaming indicators */}
      {isGenerating && (
        <>
          {/* Pulsing dot */}
          <span className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 relative">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ background: 'var(--accent)' }}
              />
              <span
                className="relative inline-flex rounded-full h-1.5 w-1.5"
                style={{ background: 'var(--accent)' }}
              />
            </span>
            <span style={{ color: 'var(--text-accent)', fontWeight: 500 }}>生成中</span>
          </span>

          <span className="opacity-20" style={{ color: 'var(--text-tertiary)' }}>·</span>

          {/* Tokens/sec */}
          <span className="flex items-center gap-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>速度</span>
            {tokensPerSec > 0 ? `${tokensPerSec.toFixed(1)} tok/s` : '...'}
          </span>

          <span className="opacity-20" style={{ color: 'var(--text-tertiary)' }}>·</span>

          {/* Total tokens */}
          <span className="flex items-center gap-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>Tokens</span>
            {totalTokens.toLocaleString()}
          </span>

          <span className="opacity-20" style={{ color: 'var(--text-tertiary)' }}>·</span>

          {/* Elapsed */}
          <span className="flex items-center gap-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>耗时</span>
            {displayElapsed}
          </span>
        </>
      )}

      {/* Completed */}
      {!isGenerating && totalTokens > 0 && (
        <span className="flex items-center gap-1.5" style={{ color: 'var(--success)' }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M2.5 7L6 10.5L11.5 3.5"/>
          </svg>
          <span style={{ fontWeight: 500 }}>已完成</span>
          <span className="opacity-20" style={{ color: 'var(--text-tertiary)' }}>·</span>
          <span style={{ color: 'var(--text-secondary)' }}>{totalTokens.toLocaleString()} tokens</span>
          <span className="opacity-20" style={{ color: 'var(--text-tertiary)' }}>·</span>
          <span style={{ color: 'var(--text-secondary)' }}>{displayElapsed}</span>
        </span>
      )}

      {/* Error */}
      {hasError && (
        <span className="flex items-center gap-1.5" style={{ color: 'var(--error)' }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="7" cy="7" r="5.5"/><path d="M7 4.5v3M7 9.5h0"/>
          </svg>
          <span className="truncate max-w-[400px]">{errorMsg || '发生错误'}</span>
        </span>
      )}

      {/* Idle */}
      {!isGenerating && totalTokens === 0 && !hasError && (
        <span style={{ color: 'var(--text-tertiary)' }}>
          输入消息开始对话 · ⌘+Enter 发送 · ⌘+K 快捷键
        </span>
      )}

      <div className="flex-1" />

      {/* Stop button */}
      {isGenerating && (
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium cursor-pointer border-none transition-all duration-150"
          style={{
            background: 'rgba(239, 68, 68, 0.12)',
            color: 'var(--error)',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'; }}
          title="停止生成 (Esc)"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <rect x="1" y="1" width="8" height="8" rx="1.5"/>
          </svg>
          停止
        </button>
      )}
    </div>
  );
}
