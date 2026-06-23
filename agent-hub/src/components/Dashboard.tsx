import { useToolRegistry } from '../hooks/useToolRegistry';
import { CATEGORY_INFO } from '../lib/tools';

export default function Dashboard() {
  const { installed, getTool, getUrl, togglePin, uninstall } = useToolRegistry();

  if (installed.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 animate-fade-in">
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 text-3xl"
          style={{ background: 'var(--bg-tertiary)' }}>
          🚀
        </div>
        <h3 className="text-base font-semibold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          欢迎使用 Agent Hub
        </h3>
        <p className="text-sm text-center mb-6" style={{ color: 'var(--text-muted)', maxWidth: 320, lineHeight: 1.6 }}>
          你的 AI 聚合控制台。前往 <span style={{ color: 'var(--accent-light)' }}>App Store</span> 安装工具，打造专属工作站。
        </p>
      </div>
    );
  }

  const pinned = installed.filter(t => t.isPinned);
  const unpinned = installed.filter(t => !t.isPinned);

  return (
    <div className="h-full overflow-y-auto animate-view-enter">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            我的控制台
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            {installed.length} 个工具已安装 · 点击卡片打开
          </p>
        </div>

        {pinned.length > 0 && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)' }}>
                已置顶
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
              {pinned.map(t => <ToolWidget key={t.toolId} toolId={t.toolId} getTool={getTool} getUrl={getUrl} togglePin={togglePin} uninstall={uninstall} />)}
            </div>
          </>
        )}

        {unpinned.length > 0 && (
          <>
            {pinned.length > 0 && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                  全部工具
                </span>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {unpinned.map(t => <ToolWidget key={t.toolId} toolId={t.toolId} getTool={getTool} getUrl={getUrl} togglePin={togglePin} uninstall={uninstall} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ToolWidget({
  toolId, getTool, getUrl, togglePin, uninstall,
}: {
  toolId: string;
  getTool: (id: string) => any;
  getUrl: (id: string) => string;
  togglePin: (id: string) => Promise<void>;
  uninstall: (id: string) => Promise<void>;
}) {
  const tool = getTool(toolId);
  if (!tool) return null;
  const info = CATEGORY_INFO[tool.category];
  const url = getUrl(toolId);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="rounded-2xl p-4 transition-all duration-300 group relative cursor-pointer block no-underline"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = info?.color || 'var(--border-accent)';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Pin / Uninstall buttons */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); togglePin(toolId); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L15 9h6l-5 4 2 7-6-4-6 4 2-7-5-4h6z"/>
          </svg>
        </button>
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); uninstall(toolId); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: 'var(--error-bg)', color: 'var(--error)' }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Icon */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3"
        style={{ background: `${info?.color || '#8B5CF6'}18` }}>
        {tool.icon}
      </div>

      {/* Info */}
      <h3 className="text-sm font-semibold mb-1 truncate" style={{ color: 'var(--text-primary)' }}>
        {tool.name}
      </h3>
      <p className="text-[11px] line-clamp-2 mb-2" style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
        {tool.description}
      </p>

      {/* Category badge */}
      <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-medium"
        style={{ background: `${info?.color || '#8B5CF6'}15`, color: info?.color || '#8B5CF6' }}>
        {info?.icon} {info?.label}
      </span>
    </a>
  );
}
