import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import type { ChatMessage, ModelEntry } from '../types';
import { MODEL_REGISTRY } from '../lib/models';
import { CLOUD_MODELS, getCloudModelById, type CloudModel } from '../lib/cloud-models';
import { BUILTIN_AGENTS } from '../lib/agents';
import { BUILTIN_SKILLS } from '../lib/skills';
import { useWebLLM } from '../hooks/useWebLLM';
import { useCloudModel } from '../hooks/useCloudModel';
import { useAgent } from '../hooks/useAgent';
import { useSkillRegistry } from '../hooks/useSkillRegistry';
import SessionList from './SessionList';
import ContextPanel from './ContextPanel';
import StatusBar from './StatusBar';
import MessageActions from './MessageActions';
import CommandPalette from './CommandPalette';

// Deep Ocean syntax theme
const syntaxTheme = {
  'code[class*="language-"]': { color: '#E2E8F0', background: '#0D1B2A', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', lineHeight: 1.6 },
  'pre[class*="language-"]': { color: '#E2E8F0', background: '#0D1B2A', padding: '16px', borderRadius: '10px', overflow: 'auto' },
  comment: { color: '#546E8A' }, punctuation: { color: '#8899B4' },
  string: { color: '#10B981' }, number: { color: '#F59E0B' },
  keyword: { color: '#7C3AED' }, function: { color: '#3390FF' },
  'class-name': { color: '#00D4FF' }, operator: { color: '#8899B4' },
  boolean: { color: '#F59E0B' }, property: { color: '#3390FF' },
  tag: { color: '#7C3AED' }, 'attr-name': { color: '#00D4FF' },
};

// Slash commands
const SLASH_COMMANDS = [
  { cmd: '/translate', label: '翻译选中文本', icon: '🌐' },
  { cmd: '/code', label: '编写代码', icon: '💻' },
  { cmd: '/summarize', label: '总结上文', icon: '📋' },
  { cmd: '/explain', label: '解释概念', icon: '💡' },
  { cmd: '/fix', label: '修复错误', icon: '🔧' },
  { cmd: '/test', label: '生成测试', icon: '🧪' },
];

interface WorkspaceProps { onOpenStore: (tab?: string) => void; }

export default function Workspace({ onOpenStore }: WorkspaceProps) {
  // ─── Hooks ───
  const webLLM = useWebLLM();
  const cloudM = useCloudModel();
  const { activeAgent, switchAgent, sessions, activeSession, createSession, loadSessions, loadSession, addMessage, removeSession } = useAgent();
  const { activeSkills, toggleSkill } = useSkillRegistry();

  // ─── UI State ───
  const [input, setInput] = useState('');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('qwen2.5-7b');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentOpen, setAgentOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextOpen, setContextOpen] = useState(true);
  const [cmdPaletteOpen, setCmdPaletteOpen] = useState(false);
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashIndex, setSlashIndex] = useState(0);
  const [hoveredMsg, setHoveredMsg] = useState<string | null>(null);
  const [editingMsg, setEditingMsg] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Streaming stats
  const [tokPerSec, setTokPerSec] = useState(0);
  const [totalStreamTokens, setTotalStreamTokens] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [streamError, setStreamError] = useState('');
  const streamingStartRef = useRef(0);

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // ─── Engine selection ───
  const isCloud = selectedModelId.startsWith('cloud-');
  const activeEngine = isCloud ? cloudM : webLLM;
  const selectedLocalModel = MODEL_REGISTRY.find(m => m.id === selectedModelId);
  const selectedCloudModel = isCloud ? getCloudModelById(selectedModelId) : null;
  const displayModelName = selectedLocalModel?.name || selectedCloudModel?.name || '未选择';
  const activeSkillDefs = BUILTIN_SKILLS.filter(s => activeSkills.includes(s.id));
  const isLoading = activeEngine.loadState.status === 'loading' || activeEngine.loadState.status === 'downloading';
  const isReady = activeEngine.loadState.status === 'ready';

  // ─── Load sessions on mount ───
  useEffect(() => { loadSessions(); }, []);

  // ─── Scroll to bottom ───
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, streamingContent]);

  // ─── Global keyboard shortcuts ───
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === 'k') { e.preventDefault(); setCmdPaletteOpen(p => !p); return; }
      if (meta && e.key === 'b') { e.preventDefault(); setSidebarOpen(p => !p); return; }
      if (meta && e.key === '/') { e.preventDefault(); setContextOpen(p => !p); return; }
      if (e.key === 'Escape') {
        if (cmdPaletteOpen) setCmdPaletteOpen(false);
        else if (agentOpen) setAgentOpen(false);
        else if (modelOpen) setModelOpen(false);
        else if (slashOpen) setSlashOpen(false);
        else if (activeEngine.isGenerating) {} // handled separately
        // Don't close panels on Esc
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [cmdPaletteOpen, agentOpen, modelOpen, slashOpen, activeEngine.isGenerating]);

  // ─── Side effect padding ───
  useEffect(() => {
    const el = document.getElementById('workspace');
    if (!el) return;
    el.style.paddingLeft = sidebarOpen ? '260px' : '0px';
    el.style.paddingRight = contextOpen ? '280px' : '0px';
    el.style.transition = 'padding 0.35s var(--ease-out)';
    return () => { el.style.paddingLeft = ''; el.style.paddingRight = ''; };
  }, [sidebarOpen, contextOpen]);

  // ─── Load model handler ───
  const handleLoadModel = useCallback(async () => {
    if (!isCloud) {
      // Local model
      if (webLLM.currentModel?.id === selectedModelId && webLLM.loadState.status === 'ready') return;
      if (selectedLocalModel) await webLLM.loadModel(selectedLocalModel);
    } else {
      // Cloud model
      if (cloudM.currentModel?.id === selectedModelId && cloudM.loadState.status === 'ready') return;
      if (selectedCloudModel) await cloudM.loadModel(selectedCloudModel);
    }
  }, [selectedModelId, isCloud, selectedLocalModel, selectedCloudModel, webLLM, cloudM]);

  // ─── Send message ───
  const handleSend = useCallback(async (overrideInput?: string) => {
    const text = (overrideInput || input).trim();
    if (!text || activeEngine.isGenerating || !isReady) return;
    setInput('');
    setStreamError('');

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);

    // Start tracking
    streamingStartRef.current = performance.now();
    setTotalStreamTokens(0); setTokPerSec(0); setElapsedMs(0);
    const tracker = setInterval(() => {
      const elapsed = performance.now() - streamingStartRef.current;
      setElapsedMs(elapsed);
    }, 100);

    try {
      const sysPrompt = thinkingMode
        ? `${activeAgent.systemPrompt}\n\n请先进行深度思考分析，用<思考>标签包裹你的推理过程，然后给出最终答案。`
        : activeAgent.systemPrompt;

      const reply = await activeEngine.sendMessage(text, messages, activeSkills, sysPrompt);
      clearInterval(tracker);
      setTotalStreamTokens(reply.content.length);
      const finalElapsed = performance.now() - streamingStartRef.current;
      setTokPerSec(reply.content.length / (finalElapsed / 1000));
      setMessages(prev => [...prev, reply]);
    } catch (err) {
      clearInterval(tracker);
      const errStr = err instanceof Error ? err.message : String(err);
      setStreamError(errStr);
      const errMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: `❌ 错误: ${errStr}`, timestamp: Date.now() };
      setMessages(prev => [...prev, errMsg]);
    }
  }, [input, activeEngine.isGenerating, isReady, messages, activeEngine, activeSkills, thinkingMode, activeAgent.systemPrompt]);

  // ─── Key handler for input ───
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Slash command
    if (e.key === '/' && input === '') {
      e.preventDefault(); setSlashOpen(true); setSlashIndex(0);
      return;
    }
    // Navigate slash commands
    if (slashOpen) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIndex(i => Math.min(i + 1, SLASH_COMMANDS.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSlashIndex(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter') { e.preventDefault(); setInput(SLASH_COMMANDS[slashIndex].cmd + ' '); setSlashOpen(false); return; }
      if (e.key === 'Escape') { e.preventDefault(); setSlashOpen(false); return; }
    }
    // Cmd+Enter to send
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSend(); return; }
    // Enter to send (not shift)
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ─── Session handlers ───
  const handleNewSession = () => {
    const s = createSession(activeAgent.id, selectedModelId);
    setMessages([]);
  };
  const handleSelectSession = async (id: string) => {
    await loadSession(id);
    // Load messages into workspace
    const found = sessions.find(s => s.id === id);
    if (found) setMessages(found.messages);
  };
  const handleDeleteSession = (id: string) => {
    removeSession(id);
    if (id === activeSession?.id) setMessages([]);
  };
  const handleRenameSession = (id: string, title: string) => {
    // Update local state
    const s = sessions.find(s => s.id === id);
    if (s) s.title = title;
  };

  // ─── Message action handlers ───
  const handleRetry = (msg: ChatMessage) => {
    // Find the message before this one and resend
    const idx = messages.indexOf(msg);
    if (idx > 0) {
      const prev = messages[idx - 1];
      if (prev.role === 'user') {
        setMessages(messages.slice(0, idx));
        handleSend(prev.content);
      }
    }
  };
  const handleEdit = (msg: ChatMessage) => {
    setEditingMsg(msg.id);
    setEditContent(msg.content);
    setTimeout(() => {
      const el = document.getElementById(`edit-${msg.id}`);
      if (el) (el as HTMLTextAreaElement).focus();
    }, 50);
  };
  const handleSaveEdit = (id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, content: editContent } : m));
    setEditingMsg(null);
  };
  const handleContinueGenerate = () => {
    setInput('继续');
    handleSend('继续');
  };

  // ─── Stop generation ───
  const handleStop = () => {
    // Force stop by unloading/reloading (simplified)
    if (activeEngine.isGenerating) {
      // This is a best-effort stop
      setInput('');
    }
  };

  // ─── Model load progress circle (local models only) ───
  const progressPct = webLLM.loadState.status === 'downloading' ? Math.round((webLLM.loadState as {progress: number}).progress * 100) : 0;
  const progressCircle = useMemo(() => {
    if (webLLM.loadState.status !== 'downloading') return null;
    const size = 64; const sw = 5; const r = (size - sw) / 2;
    const circ = 2 * Math.PI * r; const offset = circ - (progressPct / 100) * circ;
    return (
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-elevated)" strokeWidth={sw} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--accent)" strokeWidth={sw}
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          style={{ filter: 'drop-shadow(0 0 6px rgba(0,102,255,0.4))' }} />
      </svg>
    );
  }, [webLLM.loadState.status, progressPct]);

  // ─── Merged messages (consecutive same-role) ───
  const mergedMessages = useMemo(() => {
    const merged: ChatMessage[] = [];
    for (const msg of messages) {
      const last = merged[merged.length - 1];
      if (last && last.role === msg.role) {
        last.content += '\n\n' + msg.content;
        last.toolCalls = [...(last.toolCalls || []), ...(msg.toolCalls || [])];
      } else {
        merged.push({ ...msg });
      }
    }
    return merged;
  }, [messages]);

  return (
    <>
      {/* ─── Command Palette ─── */}
      <CommandPalette
        isOpen={cmdPaletteOpen}
        onClose={() => setCmdPaletteOpen(false)}
        onToggleSessionList={() => setSidebarOpen(p => !p)}
        onToggleContextPanel={() => setContextOpen(p => !p)}
      />

      {/* ─── Session Sidebar ─── */}
      <SessionList
        sessions={sessions}
        activeId={activeSession?.id || null}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(p => !p)}
        onSelect={handleSelectSession}
        onCreate={handleNewSession}
        onDelete={handleDeleteSession}
        onRename={handleRenameSession}
      />

      {/* ─── Context Panel ─── */}
      <ContextPanel
        isOpen={contextOpen}
        onToggle={() => setContextOpen(p => !p)}
        activeAgent={activeAgent}
        currentModelName={displayModelName}
        loadState={loadState}
        activeSkills={activeSkillDefs}
        messageCount={messages.length}
        totalTokens={totalStreamTokens}
        temperature={activeAgent.temperature}
        maxTokens={activeAgent.maxTokens}
        thinkingMode={thinkingMode}
      />

      {/* ─── Workspace Main ─── */}
      <section id="workspace" className="relative py-10 px-6">
        <div className="max-w-[900px] mx-auto">

          {/* Workspace Card — 3D lift effect */}
          <div
            className="glass anim-scale-in"
            style={{
              position: 'relative', overflow: 'hidden',
              boxShadow: `
                0 1px 4px rgba(0,0,0,0.3),
                0 4px 16px rgba(0,0,0,0.4),
                0 12px 40px rgba(0,0,0,0.5)
              `,
              transition: 'all 0.4s var(--ease-spring)',
              transform: activeEngine.isGenerating ? 'translateY(-2px)' : 'translateY(0)',
              willChange: 'transform, box-shadow',
            }}
            onMouseEnter={(e) => {
              if (!activeEngine.isGenerating) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 2px 8px rgba(0,0,0,0.35), 0 8px 24px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.6), 0 0 40px rgba(0,102,255,0.06)`;
              }
            }}
            onMouseLeave={(e) => {
              if (!activeEngine.isGenerating) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 1px 4px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.4), 0 12px 40px rgba(0,0,0,0.5)`;
              }
            }}
          >
            {/* ─── Toolbar ─── */}
            <div className="flex flex-wrap items-center gap-3 px-6 py-4" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              {/* Agent */}
              <div className="relative">
                <button
                  onClick={() => { setAgentOpen(!agentOpen); setModelOpen(false); }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; }}
                >
                  <span>{activeAgent.icon}</span><span>{activeAgent.name}</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <path d="M2 3.5L5 6.5L8 3.5"/>
                  </svg>
                </button>
                {agentOpen && (
                  <div className="absolute top-full left-0 mt-2 w-44 py-1.5 rounded-xl z-20 anim-fade-up"
                    style={{ background: 'rgba(15,25,45,0.96)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xl)' }}>
                    {BUILTIN_AGENTS.map(a => (
                      <button key={a.id}
                        onClick={() => { switchAgent(a.id); setAgentOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-left cursor-pointer border-none transition-all duration-150"
                        style={{ background: a.id === activeAgent.id ? 'var(--accent-bg)' : 'transparent', color: a.id === activeAgent.id ? 'var(--text-accent)' : 'var(--text-secondary)' }}
                      >
                        <span>{a.icon}</span>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: 13 }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{a.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Model Selector */}
              <div className="relative">
                <button
                  onClick={() => { setModelOpen(!modelOpen); setAgentOpen(false); }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
                  style={{ background: isReady ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)', color: isReady ? 'var(--success)' : 'var(--text-primary)' }}
                >
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{isCloud ? '☁️' : '🧠'}</span>
                  <span>
                    {activeEngine.loadState.status === 'idle' && (isCloud ? '云端未连接' : '未加载')}
                    {activeEngine.loadState.status === 'loading' && '初始化中…'}
                    {activeEngine.loadState.status === 'downloading' && `下载 ${progressPct}%`}
                    {activeEngine.loadState.status === 'error' && '加载失败'}
                    {activeEngine.loadState.status === 'ready' && `${displayModelName}${isCloud ? ' (云端)' : ' 就绪'}`}
                  </span>
                  {isLoading && (
                    <span className="inline-block w-3 h-3 border-2 rounded-full" style={{ borderColor: 'var(--border-default)', borderTopColor: 'var(--accent)', animation: 'spin 0.6s linear infinite' }} />
                  )}
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <path d="M2 3.5L5 6.5L8 3.5"/>
                  </svg>
                </button>
                {modelOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 py-1.5 rounded-xl z-20 anim-fade-up max-h-80 overflow-y-auto"
                    style={{ background: 'rgba(15,25,45,0.96)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xl)' }}>
                    {/* 本地模型 */}
                    {MODEL_REGISTRY.map(m => (
                      <button key={m.id}
                        onClick={() => { setSelectedModelId(m.id); handleLoadModel(); setModelOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer border-none transition-all duration-150"
                        style={{ background: m.id === selectedModelId ? 'var(--accent-bg)' : 'transparent', color: 'var(--text-primary)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>{m.size}</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {m.provider} · {m.description.slice(0, 30)}
                          </div>
                        </div>
                        {webLLM.currentModel?.id === m.id && webLLM.loadState.status === 'ready' && <span style={{ color: 'var(--success)', fontSize: 11, fontWeight: 600 }}>✓</span>}
                      </button>
                    ))}
                    {/* 分隔线 */}
                    <div className="mx-3 my-1" style={{ borderTop: '1px solid var(--border-subtle)' }} />
                    {/* 云端模型 */}
                    {CLOUD_MODELS.map(m => (
                      <button key={m.id}
                        onClick={() => { setSelectedModelId(m.id); handleLoadModel(); setModelOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer border-none transition-all duration-150"
                        style={{ background: m.id === selectedModelId ? 'var(--accent-bg)' : 'transparent', color: 'var(--text-primary)' }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span style={{ fontWeight: 500, fontSize: 13 }}>{m.icon} {m.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'rgba(59,130,246,0.1)', color: '#60A5FA' }}>云端</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                            {m.provider} · {m.description.slice(0, 30)}
                          </div>
                        </div>
                        {cloudM.currentModel?.id === m.id && cloudM.loadState.status === 'ready' && <span style={{ color: 'var(--success)', fontSize: 11, fontWeight: 600 }}>✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Load/Unload */}
              {!isReady ? (
                <button onClick={handleLoadModel} disabled={isLoading}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer border-none transition-all duration-200"
                  style={{ background: 'var(--accent-bg)', color: 'var(--text-accent)', opacity: isLoading ? 0.5 : 1 }}>
                  {isLoading ? '加载中…' : (isCloud ? '连接云端' : '加载模型')}
                </button>
              ) : (
                <button onClick={() => activeEngine.unloadModel()}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer border-none transition-all duration-200"
                  style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--error)' }}>
                  {isCloud ? '断开' : '卸载'}
                </button>
              )}

              <div className="flex-1" />

              {/* Skills tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {activeSkillDefs.slice(0, 3).map(s => (
                  <span key={s.id} onClick={() => toggleSkill(s.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-all duration-200"
                    style={{ background: 'var(--accent-bg)', color: 'var(--text-accent)' }} title={`点击移除 ${s.name}`}>
                    {s.icon} {s.name}
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5"/></svg>
                  </span>
                ))}
                <button onClick={() => onOpenStore('skills')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer border-none transition-all duration-200"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)' }}>
                  + 技能
                </button>
              </div>

              {/* Thinking mode */}
              <button onClick={() => setThinkingMode(!thinkingMode)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer border-none transition-all duration-200"
                style={{ background: thinkingMode ? 'var(--thinking-bg)' : 'var(--bg-card)', color: thinkingMode ? 'var(--thinking)' : 'var(--text-tertiary)' }}
                title="深度思考模式">
                <span style={{ fontSize: 14 }}>💭</span><span>思考</span>
                <div className="w-7 h-4 rounded-full relative transition-all duration-300"
                  style={{ background: thinkingMode ? 'var(--thinking)' : 'var(--border-default)' }}>
                  <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300"
                    style={{ left: thinkingMode ? '14px' : '2px' }} />
                </div>
              </button>
            </div>

            {/* ─── Circular progress overlay (local models only) ─── */}
            {webLLM.loadState.status === 'downloading' && (
              <div className="flex items-center justify-center gap-4 py-16 anim-fade-up">
                {progressCircle}
                <div>
                  <div className="text-[15px] mb-1" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    下载模型: {selectedLocalModel?.name || '模型'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[28px] font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      {progressPct}%
                    </span>
                    <span className="text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
                      {selectedLocalModel?.size || ''} · 下载中…
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ─── Chat Area ─── */}
            {webLLM.loadState.status !== 'downloading' && (
              <div ref={chatRef} className="px-6 py-6 overflow-y-auto" style={{ minHeight: 300, maxHeight: 420 }}>
                {/* Empty state */}
                {messages.length === 0 && !activeEngine.streamingContent ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center anim-fade-up">
                    {/* 3-step guide */}
                    <div className="flex items-center gap-4 mb-8">
                      {[
                        { step: 1, label: '选择 Agent', done: true, desc: activeAgent.name },
                        { step: 2, label: '加载模型', done: isReady, desc: isReady ? displayModelName : '未加载', action: isReady ? undefined : () => handleLoadModel() },
                        { step: 3, label: '开始对话', done: false, desc: '输入你的问题' },
                      ].map(s => (
                        <div key={s.step} className="flex flex-col items-center gap-2">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300"
                            style={{
                              background: s.done ? 'var(--success-bg)' : 'var(--bg-card)',
                              color: s.done ? 'var(--success)' : 'var(--text-tertiary)',
                              border: s.done ? '2px solid rgba(16, 185, 129, 0.3)' : '2px solid var(--border-subtle)',
                              boxShadow: s.done ? '0 0 12px rgba(16, 185, 129, 0.15)' : 'none',
                            }}
                          >
                            {s.done ? '✓' : s.step}
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[12px]" style={{ fontWeight: 500, color: s.done ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                              {s.label}
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                              {s.desc}
                            </span>
                          </div>
                          {s.action && (
                            <button onClick={s.action}
                              className="mt-1 text-[10px] px-2 py-0.5 rounded cursor-pointer border-none"
                              style={{ background: 'var(--accent-bg)', color: 'var(--text-accent)' }}>
                              加载
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* AI logo */}
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                      style={{ background: 'linear-gradient(135deg, rgba(0,102,255,0.15), rgba(0,212,255,0.08))', boxShadow: '0 0 24px rgba(0,102,255,0.1)' }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--accent)' }}>
                        <circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                        <path d="M5.64 5.64l2.83 2.83m7.07 7.07l2.83 2.83M5.64 18.36l2.83-2.83m7.07-7.07l2.83-2.83"/>
                      </svg>
                    </div>

                    {/* Quick prompt cards */}
                    <p className="text-[14px] mb-4" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      开始对话
                    </p>
                    <p className="text-[12px] mb-5" style={{ color: 'var(--text-tertiary)' }}>
                      输入 / 使用快捷命令 · ⌘+Enter 发送 · ⌘+K 快捷键
                    </p>

                    {/* Scene cards */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        { icon: '💻', label: '代码助手', prompt: '/code 写一个快速排序算法，带注释' },
                        { icon: '🌐', label: '翻译专家', prompt: '/translate 翻译为英文：' },
                        { icon: '✍️', label: '写作助手', prompt: '/summarize 总结以下内容：' },
                      ].map(scene => (
                        <button key={scene.label} onClick={() => { setInput(scene.prompt); inputRef.current?.focus(); }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] cursor-pointer border-none transition-all duration-200"
                          style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-subtle)'; }}
                        >
                          <span style={{ fontSize: 16 }}>{scene.icon}</span>
                          <span>{scene.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* ── Messages ── */
                  <div className="flex flex-col gap-4">
                    {mergedMessages.map((msg, idx) => (
                      <div
                        key={msg.id}
                        className={`relative group flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                        onMouseEnter={() => setHoveredMsg(msg.id)}
                        onMouseLeave={() => setHoveredMsg(null)}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px]"
                            style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>AI</div>
                        )}
                        <div className={`max-w-[80%] ${msg.role === 'user' ? '' : 'flex-1 min-w-0'}`}>
                          <div
                            className="px-4 py-3 rounded-2xl text-[14px] leading-relaxed relative"
                            style={{
                              background: msg.role === 'user' ? 'var(--accent-bg)' : 'var(--bg-card)',
                              color: 'var(--text-primary)',
                              border: msg.role === 'user' ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            }}
                          >
                            {/* Reasoning content */}
                            {msg.reasoningContent && (
                              <details className="mb-2" open>
                                <summary className="text-[11px] cursor-pointer" style={{ color: 'var(--thinking)', fontWeight: 500 }}>
                                  💭 思考过程
                                </summary>
                                <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: 'var(--text-tertiary)', whiteSpace: 'pre-wrap' }}>
                                  {msg.reasoningContent}
                                </p>
                              </details>
                            )}

                            {/* Edit mode */}
                            {editingMsg === msg.id ? (
                              <div>
                                <textarea
                                  id={`edit-${msg.id}`}
                                  value={editContent}
                                  onChange={e => setEditContent(e.target.value)}
                                  onKeyDown={e => {
                                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); handleSaveEdit(msg.id); }
                                    if (e.key === 'Escape') setEditingMsg(null);
                                  }}
                                  className="w-full px-3 py-2 rounded-lg text-[13px] outline-none border"
                                  style={{
                                    background: 'var(--bg-root)', color: 'var(--text-primary)',
                                    borderColor: 'var(--border-accent)', fontFamily: 'var(--font-body)', minHeight: 60,
                                  }}
                                  rows={3}
                                />
                                <div className="flex items-center gap-2 mt-2">
                                  <button onClick={() => handleSaveEdit(msg.id)}
                                    className="px-3 py-1 rounded text-[11px] font-medium cursor-pointer border-none"
                                    style={{ background: 'var(--accent)', color: '#fff' }}>保存 (⌘+Enter)</button>
                                  <button onClick={() => setEditingMsg(null)}
                                    className="px-3 py-1 rounded text-[11px] cursor-pointer border-none"
                                    style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)' }}>取消</button>
                                </div>
                              </div>
                            ) : (
                              /* Markdown rendered content */
                              <div className="prose-custom" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {msg.role === 'assistant' ? (
                                  <ReactMarkdown
                                    components={{
                                      code({ className, children, ...props }) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const codeStr = String(children).replace(/\n$/, '');
                                        if (match) {
                                          return (
                                            <div className="relative my-3 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                                              <div className="flex items-center justify-between px-3 py-1.5 text-[10px]"
                                                style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--text-tertiary)' }}>
                                                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{match[1]}</span>
                                                <button
                                                  onClick={() => navigator.clipboard.writeText(codeStr)}
                                                  className="cursor-pointer border-none text-[10px] px-2 py-0.5 rounded transition-all"
                                                  style={{ background: 'transparent', color: 'var(--text-tertiary)' }}
                                                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-accent)'; }}
                                                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                                                >
                                                  复制
                                                </button>
                                              </div>
                                              <SyntaxHighlighter style={syntaxTheme} language={match[1]} PreTag="div">
                                                {codeStr}
                                              </SyntaxHighlighter>
                                            </div>
                                          );
                                        }
                                        return (
                                          <code className="px-1.5 py-0.5 rounded text-[12px]"
                                            style={{ background: 'var(--bg-elevated)', color: 'var(--cyan)', fontFamily: 'var(--font-mono)' }}>
                                            {children}
                                          </code>
                                        );
                                      },
                                      a: ({ children, href }) => (
                                        <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-accent)', textDecoration: 'underline' }}>
                                          {children}
                                        </a>
                                      ),
                                      blockquote: ({ children }) => (
                                        <blockquote className="pl-3 my-2 italic" style={{ borderLeft: '3px solid var(--accent)', color: 'var(--text-secondary)' }}>
                                          {children}
                                        </blockquote>
                                      ),
                                      table: ({ children }) => (
                                        <div className="overflow-x-auto my-2">
                                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>{children}</table>
                                        </div>
                                      ),
                                      th: ({ children }) => (
                                        <th className="px-3 py-1.5 text-left text-[12px] font-semibold" style={{ borderBottom: '2px solid var(--border-default)', color: 'var(--text-primary)' }}>
                                          {children}
                                        </th>
                                      ),
                                      td: ({ children }) => (
                                        <td className="px-3 py-1.5 text-[12px]" style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                                          {children}
                                        </td>
                                      ),
                                      ul: ({ children }) => <ul className="pl-5 my-2 space-y-1" style={{ listStyleType: 'disc', color: 'var(--text-secondary)' }}>{children}</ul>,
                                      ol: ({ children }) => <ol className="pl-5 my-2 space-y-1" style={{ listStyleType: 'decimal', color: 'var(--text-secondary)' }}>{children}</ol>,
                                    }}
                                  >
                                    {msg.content}
                                  </ReactMarkdown>
                                ) : (
                                  msg.content
                                )}
                              </div>
                            )}

                            {/* Tool calls */}
                            {msg.toolCalls && msg.toolCalls.length > 0 && (
                              <div className="mt-2 pt-2 flex flex-wrap gap-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                {msg.toolCalls.map(tc => (
                                  <span key={tc.id} className="px-2 py-0.5 rounded text-[11px]" style={{ background: 'var(--accent-bg)', color: 'var(--text-accent)' }}>
                                    🔧 {tc.name} {tc.result ? '✓' : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Message Actions — show on hover */}
                          {hoveredMsg === msg.id && editingMsg !== msg.id && (
                            <MessageActions
                              message={msg}
                              onCopy={() => {}}
                              onRetry={handleRetry}
                              onEdit={handleEdit}
                              onContinue={handleContinueGenerate}
                              onFavorite={() => {}}
                              onExport={() => {
                                const blob = new Blob([`# ${activeAgent.name} 对话\ndate: ${new Date(msg.timestamp).toISOString()}\n\n${msg.content}`], { type: 'text/markdown' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a'); a.href = url; a.download = `chat-${msg.id.slice(0,8)}.md`;
                                a.click(); URL.revokeObjectURL(url);
                              }}
                            />
                          )}
                        </div>
                        {msg.role === 'user' && (
                          <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px]"
                            style={{ background: 'var(--cyan-bg)', color: 'var(--cyan)' }}>你</div>
                        )}
                      </div>
                    ))}

                    {/* Streaming */}
                    {activeEngine.streamingContent && (
                      <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px]"
                          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>AI</div>
                        <div className="max-w-[80%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed"
                          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '18px 18px 18px 4px' }}>
                          <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                            {activeEngine.streamingContent}
                            <span className="inline-block w-1.5 h-4 ml-0.5 align-middle rounded-sm"
                              style={{ background: 'var(--accent)', animation: 'dot-pulse 0.6s ease-in-out infinite' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── Status Bar ─── */}
            <StatusBar
              isGenerating={activeEngine.isGenerating}
              tokensPerSec={tokPerSec}
              totalTokens={totalStreamTokens}
              elapsedMs={elapsedMs}
              onStop={handleStop}
              hasError={!!streamError}
              errorMsg={streamError}
            />

            {/* ─── Input Area ─── */}
            <div className="px-6 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              {/* Slash command menu */}
              {slashOpen && (
                <div className="mb-2 rounded-lg p-1.5 anim-fade-up"
                  style={{ background: 'var(--bg-glass)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-lg)' }}>
                  {SLASH_COMMANDS.map((sc, i) => (
                    <button key={sc.cmd}
                      onClick={() => { setInput(sc.cmd + ' '); setSlashOpen(false); inputRef.current?.focus(); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-left cursor-pointer border-none transition-all duration-100"
                      style={{
                        background: i === slashIndex ? 'var(--accent-bg)' : 'transparent',
                        color: i === slashIndex ? 'var(--text-accent)' : 'var(--text-secondary)',
                      }}>
                      <span style={{ fontSize: 16 }}>{sc.icon}</span>
                      <span className="font-mono text-[12px] font-medium" style={{ color: 'var(--accent)' }}>{sc.cmd}</span>
                      <span>{sc.label}</span>
                      {i === slashIndex && <span className="ml-auto text-[10px]" style={{ color: 'var(--text-tertiary)' }}>↵</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isReady ? '输入你的问题… (⌘+Enter 发送, / 快捷命令)' : '请先加载模型'}
                  rows={2}
                  disabled={!isReady}
                  className="flex-1 px-4 py-3 rounded-xl text-[14px] leading-relaxed resize-none outline-none transition-all duration-200"
                  style={{
                    background: 'var(--bg-card)', color: 'var(--text-primary)',
                    border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-body)', maxHeight: 120,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-bg)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!isReady || activeEngine.isGenerating || !input.trim()}
                  className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all duration-200"
                  style={{
                    background: isReady && input.trim() && !activeEngine.isGenerating
                      ? 'linear-gradient(135deg, var(--accent), #0080FF)'
                      : 'var(--bg-card)',
                    color: isReady && input.trim() && !activeEngine.isGenerating ? '#fff' : 'var(--text-tertiary)',
                    opacity: isReady && input.trim() && !activeEngine.isGenerating ? 1 : 0.5,
                    boxShadow: isReady && input.trim() && !activeEngine.isGenerating ? '0 4px 16px rgba(0, 102, 255, 0.3)' : 'none',
                    transform: isReady && input.trim() ? 'scale(1)' : 'scale(0.98)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M2 9l14-7-3.5 7L16 16z"/>
                  </svg>
                </button>
              </div>

              {/* Bottom info row */}
              <div className="flex items-center justify-between mt-2.5 px-1">
                <div className="flex items-center gap-3">
                  <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                    {isReady ? displayModelName : '模型未加载'}
                  </span>
                  {thinkingMode && (
                    <span className="text-[11px] font-medium" style={{ color: 'var(--thinking)' }}>💭 深度思考</span>
                  )}
                  <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                    ⌘K 快捷键
                  </span>
                </div>
                <button
                  onClick={() => onOpenStore('tools')}
                  className="text-[11px] px-2.5 py-1 rounded-lg cursor-pointer border-none transition-all duration-200"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)' }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
                >
                  + 工具商店
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
