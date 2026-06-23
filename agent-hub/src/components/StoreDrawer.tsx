import { useState, useEffect, useCallback } from 'react';
import { MODEL_REGISTRY } from '../lib/models';
import { BUILTIN_SKILLS } from '../lib/skills';
import { TOOL_CATALOG } from '../lib/tools';
import { CLOUD_MODELS, CLOUD_PROVIDERS } from '../lib/cloud-models';
import { useSkillRegistry } from '../hooks/useSkillRegistry';
import { getApiKey, getEndpoint, saveApiKey, saveEndpoint, testConnection } from '../lib/cloud-api';

interface StoreDrawerProps {
  open: boolean;
  initialTab?: string;
  onClose: () => void;
}

const TABS = [
  { id: 'tools', label: '工具商店', icon: '🔧' },
  { id: 'models', label: '模型中心', icon: '🧠' },
  { id: 'skills', label: '技能管理', icon: '⚡' },
];

export default function StoreDrawer({ open, initialTab, onClose }: StoreDrawerProps) {
  const [tab, setTab] = useState(initialTab || 'tools');
  const [closing, setClosing] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Skill registry
  const { activeSkills, toggleSkill } = useSkillRegistry();

  // API Key config modal
  const [configOpen, setConfigOpen] = useState(false);
  const [configProvider, setConfigProvider] = useState<{ id: string; name: string; endpoint: string } | null>(null);
  const [configApiKey, setConfigApiKey] = useState('');
  const [configEndpoint, setConfigEndpoint] = useState('');
  const [configTesting, setConfigTesting] = useState(false);
  const [configTestResult, setConfigTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [configSaving, setConfigSaving] = useState(false);

  // Track which providers have API keys configured
  const [configuredProviders, setConfiguredProviders] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialTab) setTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (open) {
      setClosing(false);
      document.body.style.overflow = 'hidden';
      // Check which providers have API keys
      checkConfiguredProviders();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const checkConfiguredProviders = useCallback(async () => {
    const providers = Object.keys(CLOUD_PROVIDERS);
    const result: Record<string, boolean> = {};
    for (const pid of providers) {
      const key = await getApiKey(pid);
      result[pid] = !!key && key.length > 0;
    }
    setConfiguredProviders(result);
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 300);
  };

  // ─── API Key Config ───
  const openConfig = useCallback(async (providerId: string) => {
    const provider = CLOUD_PROVIDERS[providerId];
    if (!provider) return;
    setConfigProvider({ id: providerId, name: provider.name, endpoint: provider.defaultEndpoint });
    setConfigApiKey(await getApiKey(providerId) || '');
    setConfigEndpoint(await getEndpoint(providerId) || provider.defaultEndpoint);
    setConfigTestResult(null);
    setConfigOpen(true);
  }, []);

  const handleTest = useCallback(async () => {
    if (!configProvider) return;
    setConfigTesting(true);
    setConfigTestResult(null);
    const result = await testConnection(configProvider.id, configApiKey, configEndpoint);
    setConfigTestResult(result);
    setConfigTesting(false);
  }, [configProvider, configApiKey, configEndpoint]);

  const handleSaveConfig = useCallback(async () => {
    if (!configProvider) return;
    setConfigSaving(true);
    await saveApiKey(configProvider.id, configApiKey);
    await saveEndpoint(configProvider.id, configEndpoint);
    setConfigSaving(false);
    setConfigOpen(false);
    checkConfiguredProviders();
  }, [configProvider, configApiKey, configEndpoint, checkConfiguredProviders]);

  // ─── Tool install (placeholder) ───
  const handleInstallTool = useCallback((toolId: string) => {
    alert(`工具「${toolId}」安装功能即将上线，敬请期待！`);
  }, []);

  if (!open && !closing) return null;

  const categories = [...new Set(TOOL_CATALOG.map(t => t.category))];
  const filteredTools = TOOL_CATALOG.filter(t => {
    if (filter !== 'all' && t.category !== filter) return false;
    if (search && !t.name.includes(search) && !t.description.includes(search)) return false;
    return true;
  });

  // Group cloud models by provider
  const cloudByProvider = CLOUD_MODELS.reduce((acc, m) => {
    if (!acc[m.providerId]) acc[m.providerId] = [];
    acc[m.providerId].push(m);
    return acc;
  }, {} as Record<string, typeof CLOUD_MODELS>);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        className="fixed inset-0 z-50 transition-all duration-300"
        style={{ background: closing ? 'transparent' : 'rgba(0,0,0,0.5)', backdropFilter: closing ? 'none' : 'blur(4px)' }}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col transition-all duration-300 ease-out"
        style={{
          width: 460,
          transform: closing ? 'translateX(100%)' : 'translateX(0)',
          background: 'rgba(8, 14, 24, 0.97)',
          backdropFilter: 'blur(30px)',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 className="text-[17px] m-0" style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}>
            资源中心
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none transition-all duration-200"
            style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-tertiary)'; }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l10 10M12 2l-10 10"/></svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-6 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
              style={{
                background: tab === t.id ? 'var(--accent-bg)' : 'transparent',
                color: tab === t.id ? 'var(--text-accent)' : 'var(--text-tertiary)',
              }}
            >
              <span style={{ marginRight: 4 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* ─── Tab: Tools ─── */}
          {tab === 'tools' && (
            <>
              {/* Search */}
              <input
                type="text"
                placeholder="搜索工具…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-[13px] mb-4 outline-none border transition-all duration-200"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border-subtle)',
                  fontFamily: 'var(--font-body)',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
              />

              {/* Category filter */}
              <div className="flex flex-wrap gap-1.5 mb-5">
                <button
                  onClick={() => setFilter('all')}
                  className="px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer border-none transition-all duration-200"
                  style={{ background: filter === 'all' ? 'var(--accent-bg)' : 'var(--bg-card)', color: filter === 'all' ? 'var(--text-accent)' : 'var(--text-tertiary)' }}
                >
                  全部
                </button>
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    className="px-3 py-1 rounded-full text-[11px] font-medium cursor-pointer border-none transition-all duration-200"
                    style={{ background: filter === c ? 'var(--accent-bg)' : 'var(--bg-card)', color: filter === c ? 'var(--text-accent)' : 'var(--text-tertiary)' }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Tool list */}
              <div className="flex flex-col gap-2">
                {filteredTools.map(tool => (
                  <div
                    key={tool.id}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[18px]"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      {tool.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] mb-0.5" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {tool.name}
                      </div>
                      <div className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {tool.description}
                      </div>
                    </div>
                    <button
                      onClick={() => handleInstallTool(tool.id)}
                      className="px-3 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer border-none transition-all duration-200"
                      style={{ background: 'var(--accent-bg)', color: 'var(--text-accent)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
                    >
                      安装
                    </button>
                  </div>
                ))}
                {filteredTools.length === 0 && (
                  <div className="text-center py-12" style={{ color: 'var(--text-tertiary)' }}>
                    <p className="text-[13px]">未找到匹配的工具</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ─── Tab: Models ─── */}
          {tab === 'models' && (
            <div className="flex flex-col gap-6">
              <div>
                <h4 className="text-[14px] mb-3" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  本地模型 (WebLLM)
                </h4>
                <div className="flex flex-col gap-2">
                  {MODEL_REGISTRY.map(m => (
                    <div
                      key={m.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[13px]" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>{m.size}</span>
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{m.provider} · {m.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-[14px] mb-3" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  云端模型 (OpenAI 兼容)
                </h4>
                <div className="flex flex-col gap-4">
                  {Object.entries(cloudByProvider).map(([providerId, models]) => (
                    <div key={providerId}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                          {CLOUD_PROVIDERS[providerId]?.name || providerId}
                          {configuredProviders[providerId] && (
                            <span style={{ color: 'var(--success)', marginLeft: 6, fontSize: 11 }}>● 已配置</span>
                          )}
                        </span>
                        <button
                          onClick={() => openConfig(providerId)}
                          className="px-2.5 py-1 rounded-lg text-[11px] cursor-pointer border-none transition-all duration-200"
                          style={{
                            background: configuredProviders[providerId] ? 'rgba(16,185,129,0.08)' : 'var(--accent-bg)',
                            color: configuredProviders[providerId] ? 'var(--success)' : 'var(--text-accent)',
                          }}
                        >
                          {configuredProviders[providerId] ? '修改配置' : '配置 API Key'}
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {models.map(m => (
                          <div
                            key={m.id}
                            className="flex items-center gap-3 p-3 rounded-xl"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[13px]" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</span>
                                <span className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>{m.contextLength.toLocaleString()} ctx</span>
                              </div>
                              <div className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{m.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ─── Tab: Skills ─── */}
          {tab === 'skills' && (
            <div className="flex flex-col gap-2">
              {BUILTIN_SKILLS.map(skill => {
                const isActive = activeSkills.includes(skill.id);
                return (
                  <div
                    key={skill.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[18px]"
                      style={{ background: 'var(--bg-elevated)' }}
                    >
                      {skill.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] mb-0.5" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                        {skill.name}
                      </div>
                      <div className="text-[11px] truncate" style={{ color: 'var(--text-tertiary)' }}>
                        {skill.description}
                      </div>
                    </div>
                    <div
                      className="w-9 h-5 rounded-full relative cursor-pointer transition-all duration-300"
                      style={{ background: isActive ? 'var(--accent)' : 'var(--bg-elevated)' }}
                      onClick={() => toggleSkill(skill.id)}
                    >
                      <div
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm"
                        style={{ left: isActive ? '18px' : '2px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ─── API Key Config Modal ─── */}
      {configOpen && configProvider && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setConfigOpen(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 z-[61] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 anim-fade-up"
            style={{ background: 'rgba(12,20,35,0.98)', backdropFilter: 'blur(30px)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xl)' }}
          >
            <h4 className="text-[16px] mb-1" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
              配置 {configProvider.name}
            </h4>
            <p className="text-[12px] mb-5" style={{ color: 'var(--text-tertiary)' }}>
              配置后可在模型中心选择对应云端模型进行对话
            </p>

            {/* API Endpoint */}
            <label className="block text-[12px] mb-1.5" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              API 端点
            </label>
            <input
              type="text"
              value={configEndpoint}
              onChange={e => setConfigEndpoint(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] mb-4 outline-none border"
              style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', fontFamily: 'var(--font-mono)' }}
            />

            {/* API Key */}
            <label className="block text-[12px] mb-1.5" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              API Key
            </label>
            <input
              type="password"
              value={configApiKey}
              onChange={e => setConfigApiKey(e.target.value)}
              placeholder={CLOUD_MODELS.find(m => m.providerId === configProvider.id)?.apiKeyPlaceholder || '请输入 API Key'}
              className="w-full px-3 py-2.5 rounded-lg text-[13px] mb-4 outline-none border"
              style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', fontFamily: 'var(--font-mono)' }}
            />

            {/* Test result */}
            {configTestResult && (
              <div
                className="px-3 py-2.5 rounded-lg mb-4 text-[12px]"
                style={{
                  background: configTestResult.ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  color: configTestResult.ok ? 'var(--success)' : 'var(--error)',
                  border: `1px solid ${configTestResult.ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}
              >
                {configTestResult.ok ? '✅ ' : '❌ '}{configTestResult.message}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={handleTest}
                disabled={configTesting || !configApiKey}
                className="px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer border transition-all duration-200"
                style={{
                  background: 'transparent',
                  color: configTesting || !configApiKey ? 'var(--text-tertiary)' : 'var(--text-accent)',
                  borderColor: 'var(--border-subtle)',
                  opacity: configTesting || !configApiKey ? 0.5 : 1,
                }}
              >
                {configTesting ? '测试中…' : '测试连接'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfigOpen(false)}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)' }}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveConfig}
                  disabled={configSaving || !configApiKey}
                  className="px-4 py-2 rounded-lg text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
                  style={{
                    background: 'var(--accent-bg)',
                    color: 'var(--text-accent)',
                    opacity: configSaving || !configApiKey ? 0.5 : 1,
                  }}
                >
                  {configSaving ? '保存中…' : '保存配置'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
