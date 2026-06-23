import { useState, useRef, useEffect, useCallback } from 'react';
import { MODEL_REGISTRY } from '../lib/models';
import { BUILTIN_AGENTS } from '../lib/agents';
import { BUILTIN_SKILLS } from '../lib/skills';
import { useWebLLM } from '../hooks/useWebLLM';
import { useAgent } from '../hooks/useAgent';
import { useSkillRegistry } from '../hooks/useSkillRegistry';
import type { ChatMessage, ModelEntry, AgentConfig } from '../types';

interface WorkspaceProps {
  onOpenStore: (tab?: string) => void;
}

export default function Workspace({ onOpenStore }: WorkspaceProps) {
  // Hooks
  const { loadModel, sendMessage, loadState, currentModel, isGenerating, streamingContent, reasoningContent, unloadModel } = useWebLLM();
  const { activeAgent, switchAgent, activeSession, createSession, addMessage } = useAgent();
  const { activeSkills, toggleSkill } = useSkillRegistry();

  // UI state
  const [input, setInput] = useState('');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState('qwen2.5-7b');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentOpen, setAgentOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectedModel = MODEL_REGISTRY.find(m => m.id === selectedModelId)!;
  const activeSkillDefs = BUILTIN_SKILLS.filter(s => activeSkills.includes(s.id));
  const isLoading = loadState.status === 'loading' || loadState.status === 'downloading';

  // Scroll to bottom
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Load model handler
  const handleLoadModel = useCallback(async () => {
    if (currentModel?.id === selectedModelId && loadState.status === 'ready') return;
    await loadModel(selectedModel);
  }, [selectedModelId, currentModel, loadState.status, selectedModel, loadModel]);

  // Send message
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isGenerating || loadState.status !== 'ready') return;
    setInput('');

    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() };
    const history = [...messages, userMsg];
    setMessages(history);

    try {
      const sysPrompt = thinkingMode
        ? `${activeAgent.systemPrompt}\n\n请先进行深度思考分析，用<思考>标签包裹你的推理过程，然后给出最终答案。`
        : activeAgent.systemPrompt;

      const reply = await sendMessage(text, messages, activeSkills, sysPrompt);
      setMessages(prev => [...prev, reply]);
    } catch (err) {
      const errMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: `错误: ${err instanceof Error ? err.message : String(err)}`, timestamp: Date.now() };
      setMessages(prev => [...prev, errMsg]);
    }
  }, [input, isGenerating, loadState.status, messages, sendMessage, activeSkills, thinkingMode, activeAgent.systemPrompt]);

  // Key handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // Model progress display
  const modelStatusText = () => {
    if (loadState.status === 'idle') return '未加载';
    if (loadState.status === 'loading') return '初始化中…';
    if (loadState.status === 'downloading' && loadState.progress) return `下载中 ${Math.round(loadState.progress * 100)}%`;
    if (loadState.status === 'error') return '加载失败';
    if (loadState.status === 'ready') return `${selectedModel.name} 就绪`;
    return '未知';
  };

  return (
    <section id="workspace" className="relative py-20 px-6">
      <div className="max-w-[900px] mx-auto">
        {/* Section header */}
        <div className="text-center mb-12 anim-fade-up">
          <h2
            className="text-[32px] tracking-[-0.01em] mb-3"
            style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--text-primary)' }}
          >
            AI 工作台
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            选择模型和技能，开始本地 AI 对话
          </p>
        </div>

        {/* Workspace Card */}
        <div
          className="glass anim-scale-in"
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          {/* ─── Toolbar ─── */}
          <div
            className="flex flex-wrap items-center gap-3 px-6 py-4"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            {/* Agent Selector */}
            <div className="relative">
              <button
                onClick={() => { setAgentOpen(!agentOpen); setModelOpen(false); }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium cursor-pointer border-none transition-all duration-200"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; }}
              >
                <span>{activeAgent.icon}</span>
                <span>{activeAgent.name}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-tertiary)' }}>
                  <path d="M2 3.5L5 6.5L8 3.5"/>
                </svg>
              </button>
              {agentOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-44 py-1.5 rounded-xl z-20 anim-fade-up"
                  style={{ background: 'rgba(15,25,45,0.95)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xl)' }}
                >
                  {BUILTIN_AGENTS.map(a => (
                    <button
                      key={a.id}
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
                style={{ background: loadState.status === 'ready' ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)', color: loadState.status === 'ready' ? 'var(--success)' : 'var(--text-primary)' }}
              >
                <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>🧠</span>
                <span>{modelStatusText()}</span>
                {isLoading && (
                  <span className="inline-block w-3 h-3 border-2 rounded-full anim-spin" style={{ borderColor: 'var(--border-default)', borderTopColor: 'var(--accent)', animation: 'spin 0.6s linear infinite' }} />
                )}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-tertiary)' }}>
                  <path d="M2 3.5L5 6.5L8 3.5"/>
                </svg>
              </button>
              {modelOpen && (
                <div
                  className="absolute top-full left-0 mt-2 w-72 py-1.5 rounded-xl z-20 anim-fade-up"
                  style={{ background: 'rgba(15,25,45,0.95)', backdropFilter: 'blur(24px)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-xl)' }}
                >
                  {MODEL_REGISTRY.map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setSelectedModelId(m.id); handleLoadModel(); setModelOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer border-none transition-all duration-150"
                      style={{ background: m.id === selectedModelId ? 'var(--accent-bg)' : 'transparent', color: 'var(--text-primary)' }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span style={{ fontWeight: 500, fontSize: 13 }}>{m.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: 'var(--bg-elevated)', color: 'var(--text-tertiary)' }}>
                            {m.size}
                          </span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {m.provider} · {m.description}
                        </div>
                      </div>
                      {currentModel?.id === m.id && loadState.status === 'ready' && (
                        <span style={{ color: 'var(--success)', fontSize: 11, fontWeight: 600 }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Load/Unload */}
            {loadState.status !== 'ready' ? (
              <button
                onClick={handleLoadModel}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer border-none transition-all duration-200"
                style={{ background: 'var(--accent-bg)', color: 'var(--text-accent)', opacity: isLoading ? 0.5 : 1 }}
              >
                {isLoading ? '加载中…' : '加载模型'}
              </button>
            ) : (
              <button
                onClick={unloadModel}
                className="px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer border-none transition-all duration-200"
                style={{ background: 'rgba(239, 68, 68, 0.08)', color: 'var(--error)' }}
              >
                卸载
              </button>
            )}

            <div className="flex-1" />

            {/* Skills tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {activeSkillDefs.slice(0, 3).map(s => (
                <span
                  key={s.id}
                  onClick={() => toggleSkill(s.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer transition-all duration-200"
                  style={{ background: 'var(--accent-bg)', color: 'var(--text-accent)' }}
                  title={`点击移除 ${s.name}`}
                >
                  {s.icon} {s.name}
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5"/></svg>
                </span>
              ))}
              <button
                onClick={() => onOpenStore('skills')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer border-none transition-all duration-200"
                style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)' }}
              >
                + 技能
              </button>
            </div>

            {/* Thinking mode */}
            <button
              onClick={() => setThinkingMode(!thinkingMode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer border-none transition-all duration-200"
              style={{
                background: thinkingMode ? 'var(--thinking-bg)' : 'var(--bg-card)',
                color: thinkingMode ? 'var(--thinking)' : 'var(--text-tertiary)',
              }}
              title="深度思考模式"
            >
              <span style={{ fontSize: 14 }}>💭</span>
              <span>思考</span>
              <div
                className="w-7 h-4 rounded-full relative transition-all duration-300"
                style={{ background: thinkingMode ? 'var(--thinking)' : 'var(--border-default)' }}
              >
                <div
                  className="absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-300"
                  style={{ left: thinkingMode ? '14px' : '2px' }}
                />
              </div>
            </button>
          </div>

          {/* ─── Chat Area ─── */}
          <div
            ref={chatRef}
            className="px-6 py-6 overflow-y-auto"
            style={{ minHeight: 320, maxHeight: 480 }}
          >
            {messages.length === 0 && !streamingContent ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 text-center anim-fade-up">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: 'var(--accent-bg)' }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ color: 'var(--accent)' }}>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v4m0 12v4M2 12h4m12 0h4"/>
                  </svg>
                </div>
                <p className="text-[15px] mb-1" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                  开始对话
                </p>
                <p className="text-[13px] mb-8" style={{ color: 'var(--text-tertiary)' }}>
                  选择模型并加载后，即可在浏览器中与本地 AI 对话
                </p>
                {/* Quick prompts */}
                <div className="grid grid-cols-2 gap-2 max-w-sm">
                  {['介绍一下你自己', '写一段 Python 代码', '帮我翻译一段英文', '解释什么是 WebGPU'].map(q => (
                    <button
                      key={q}
                      onClick={() => { setInput(q); inputRef.current?.focus(); }}
                      className="px-3 py-2 rounded-lg text-[12px] text-left cursor-pointer border-none transition-all duration-200"
                      style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="flex flex-col gap-5">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div
                        className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px]"
                        style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                      >
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed`}
                      style={{
                        background: msg.role === 'user' ? 'var(--accent-bg)' : 'var(--bg-card)',
                        color: 'var(--text-primary)',
                        border: msg.role === 'user' ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
                        borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      }}
                    >
                      {msg.reasoningContent && (
                        <details className="mb-2" open>
                          <summary className="text-[11px] cursor-pointer" style={{ color: 'var(--thinking)', fontWeight: 500 }}>
                            思考过程
                          </summary>
                          <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: 'var(--text-tertiary)', whiteSpace: 'pre-wrap' }}>
                            {msg.reasoningContent}
                          </p>
                        </details>
                      )}
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{msg.content}</div>
                      {msg.toolCalls && msg.toolCalls.length > 0 && (
                        <div className="mt-2 pt-2 flex flex-wrap gap-1" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          {msg.toolCalls.map(tc => (
                            <span key={tc.id} className="px-2 py-0.5 rounded text-[11px]" style={{ background: 'var(--accent-bg)', color: 'var(--text-accent)' }}>
                              🔧 {tc.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div
                        className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px]"
                        style={{ background: 'var(--cyan-bg)', color: 'var(--cyan)' }}
                      >
                        你
                      </div>
                    )}
                  </div>
                ))}

                {/* Streaming content */}
                {streamingContent && (
                  <div className="flex gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px]"
                      style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
                    >
                      AI
                    </div>
                    <div
                      className="max-w-[75%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed"
                      style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '18px 18px 18px 4px' }}
                    >
                      <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {streamingContent}
                        <span
                          className="inline-block w-1.5 h-4 ml-0.5 align-middle"
                          style={{ background: 'var(--accent)', animation: 'dot-pulse 0.8s ease-in-out infinite' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ─── Input Area ─── */}
          <div
            className="px-6 py-4"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={loadState.status === 'ready' ? '输入你的问题…' : '请先加载模型'}
                rows={2}
                disabled={loadState.status !== 'ready'}
                className="flex-1 px-4 py-3 rounded-xl text-[14px] leading-relaxed resize-none outline-none transition-all duration-200"
                style={{
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  fontFamily: 'var(--font-body)',
                  maxHeight: '120px',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-bg)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <button
                onClick={handleSend}
                disabled={loadState.status !== 'ready' || isGenerating || !input.trim()}
                className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center cursor-pointer border-none transition-all duration-200"
                style={{
                  background: loadState.status === 'ready' && input.trim()
                    ? 'linear-gradient(135deg, var(--accent), #0080FF)'
                    : 'var(--bg-card)',
                  color: loadState.status === 'ready' && input.trim() ? '#fff' : 'var(--text-tertiary)',
                  opacity: loadState.status === 'ready' && input.trim() ? 1 : 0.5,
                  boxShadow: loadState.status === 'ready' && input.trim() ? '0 4px 16px rgba(0, 102, 255, 0.3)' : 'none',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 9l14-7-3.5 7L16 16z"/>
                </svg>
              </button>
            </div>
            {/* Status bar */}
            <div className="flex items-center justify-between mt-2.5 px-1">
              <div className="flex items-center gap-3">
                <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
                  {loadState.status === 'ready' ? `${selectedModel.name}` : '模型未加载'}
                </span>
                {thinkingMode && (
                  <span className="text-[11px] font-medium" style={{ color: 'var(--thinking)' }}>💭 深度思考</span>
                )}
              </div>
              <button
                onClick={() => onOpenStore('tools')}
                className="text-[11px] px-2.5 py-1 rounded-lg cursor-pointer border-none transition-all duration-200"
                style={{ background: 'var(--bg-card)', color: 'var(--text-tertiary)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-accent)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              >
                + 工具商店
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
