import { useState, useCallback, useEffect, useRef } from 'react';
import type { ModelEntry, ChatMessage, SkillDefinition } from '../types';
import { useWebLLM } from '../hooks/useWebLLM';
import { useAgent } from '../hooks/useAgent';
import { useSkillRegistry } from '../hooks/useSkillRegistry';
import { MODEL_REGISTRY } from '../lib/models';
import { BUILTIN_AGENTS } from '../lib/agents';

interface WorkspaceProps {
  onOpenStore: () => void;
  onOpenSkills: () => void;
}

export function Workspace({ onOpenStore, onOpenSkills }: WorkspaceProps) {
  const webLLM = useWebLLM();
  const agent = useAgent();
  const skillReg = useSkillRegistry();
  const [thinkingMode, setThinkingMode] = useState(false);
  const [msgInput, setMsgInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showAgentMenu, setShowAgentMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { agent.loadSessions(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, webLLM.streamingContent]);

  const activeSkills = skillReg.skills.filter(s => skillReg.activeSkills.includes(s.id));

  const sendMessage = useCallback(async () => {
    const text = msgInput.trim();
    if (!text || !webLLM.currentModel || webLLM.isGenerating) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setMsgInput('');
    try {
      const sys = thinkingMode
        ? `${agent.activeAgent.systemPrompt}\n\n请在回答前进行深度思考分析，展示推理过程。`
        : agent.activeAgent.systemPrompt;
      const reply = await webLLM.sendMessage(text, messages, skillReg.activeSkills, sys);
      setMessages(prev => [...prev, reply]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(), role: 'assistant',
        content: `❌ 错误：${e instanceof Error ? e.message : String(e)}`,
        timestamp: Date.now()
      }]);
    }
  }, [msgInput, webLLM, messages, agent.activeAgent, skillReg.activeSkills, thinkingMode]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* === Toolbar: Agent + Model + Skills + Thinking === */}
      <div
        className="px-5 py-3 flex flex-wrap items-center gap-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {/* Agent Picker */}
        <div className="relative">
          <button
            onClick={() => { setShowAgentMenu(!showAgentMenu); setShowModelMenu(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span>{agent.activeAgent.icon}</span>
            <span style={{ fontFamily: 'var(--font-body)' }}>{agent.activeAgent.name}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {showAgentMenu && (
            <div
              className="absolute top-full mt-1 left-0 w-52 rounded-xl py-1 z-30 animate-fade-in"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {BUILTIN_AGENTS.map(a => (
                <button key={a.id} onClick={() => { agent.switchAgent(a.id); setShowAgentMenu(false); }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2.5 text-sm transition-colors"
                  style={{
                    color: agent.activeAgent.id === a.id ? 'var(--accent-light)' : 'var(--text-secondary)',
                    background: agent.activeAgent.id === a.id ? 'var(--accent-bg)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (agent.activeAgent.id !== a.id) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { if (agent.activeAgent.id !== a.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="text-base">{a.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ fontFamily: 'var(--font-body)' }}>{a.name}</div>
                    <div className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{a.description}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Model Picker */}
        <div className="relative">
          <button
            onClick={() => { setShowModelMenu(!showModelMenu); setShowAgentMenu(false); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
            style={{
              background: webLLM.currentModel ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
              color: webLLM.currentModel ? 'var(--accent-light)' : 'var(--text-secondary)',
              border: webLLM.currentModel ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
            <span style={{ fontFamily: 'var(--font-body)' }}>
              {webLLM.currentModel ? webLLM.currentModel.name : '选择模型'}
            </span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          {showModelMenu && (
            <div
              className="absolute top-full mt-1 left-0 w-72 rounded-xl py-1 z-30 max-h-80 overflow-y-auto animate-fade-in"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              {MODEL_REGISTRY.map(m => (
                <button key={m.id}
                  onClick={() => { webLLM.loadModel(m); setShowModelMenu(false); }}
                  disabled={webLLM.loadState.status === 'loading' || webLLM.loadState.status === 'downloading'}
                  className="w-full px-3 py-2.5 text-left flex items-center gap-3 text-sm transition-colors"
                  style={{
                    color: webLLM.currentModel?.id === m.id ? 'var(--accent-light)' : 'var(--text-secondary)',
                    background: webLLM.currentModel?.id === m.id ? 'var(--accent-bg)' : 'transparent',
                    opacity: (webLLM.loadState.status === 'loading' || webLLM.loadState.status === 'downloading') ? 0.5 : 1,
                  }}
                  onMouseEnter={e => { if (webLLM.currentModel?.id !== m.id) e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { if (webLLM.currentModel?.id !== m.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
                  >
                    {m.provider[0]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate" style={{ fontFamily: 'var(--font-body)' }}>{m.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.size} · {m.description}</div>
                  </div>
                  {webLLM.currentModel?.id === m.id && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)' }}>当前</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading indicator */}
        {(webLLM.loadState.status === 'loading' || webLLM.loadState.status === 'downloading') && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>
            <span className="animate-spin-slow inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full"/>
            加载中 {webLLM.loadState.status === 'downloading' ? `${Math.round((webLLM.loadState as any).progress * 100)}%` : '...'}
          </div>
        )}

        {/* Separator */}
        <div className="w-px h-6" style={{ background: 'var(--border-subtle)' }} />

        {/* Active Skills */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
          <button
            onClick={onOpenSkills}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
            style={{
              background: 'var(--accent-bg)',
              color: 'var(--accent-light)',
              border: '1px solid var(--border-accent)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            技能
          </button>
          {activeSkills.slice(0, 6).map(skill => (
            <button
              key={skill.id}
              onClick={() => skillReg.toggleSkill(skill.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200"
              style={{
                background: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
              title={skill.description}
            >
              <span>{skill.icon}</span>
              <span>{skill.name}</span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          ))}
          {activeSkills.length > 6 && (
            <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
              +{activeSkills.length - 6}
            </span>
          )}
        </div>

        {/* Thinking Mode Toggle */}
        <button
          onClick={() => setThinkingMode(!thinkingMode)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
          style={{
            background: thinkingMode ? 'var(--accent-bg)' : 'var(--bg-tertiary)',
            color: thinkingMode ? 'var(--accent-light)' : 'var(--text-muted)',
            border: thinkingMode ? '1px solid var(--border-accent)' : '1px solid var(--border-subtle)',
            boxShadow: thinkingMode ? '0 0 12px rgba(139,92,246,0.15)' : 'none',
          }}
        >
          <span>💭</span>
          <span>思考模式</span>
          <div
            className="w-5 h-3 rounded-full relative transition-colors duration-200"
            style={{ background: thinkingMode ? 'var(--accent)' : 'var(--border-default)' }}
          >
            <div
              className="absolute top-0.5 w-2 h-2 rounded-full bg-white transition-transform duration-200"
              style={{ left: thinkingMode ? '10px' : '2px' }}
            />
          </div>
        </button>

        {/* Store button */}
        <button
          onClick={onOpenStore}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          工具商店
        </button>

        {/* Unload model */}
        {webLLM.currentModel && (
          <button
            onClick={() => webLLM.unloadModel()}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
            style={{ color: 'var(--text-muted)' }}
            title="卸载模型释放内存"
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--error)'; e.currentTarget.style.background = 'var(--error-bg)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14"/></svg>
          </button>
        )}
      </div>

      {/* === Chat Messages === */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center" style={{ color: 'var(--text-muted)' }}>
            {/* Empty state */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-5 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
                style={{ color: 'var(--accent-light)' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M8 9h8M8 13h6" opacity="0.5"/>
              </svg>
              <div className="absolute inset-0 rounded-2xl opacity-20"
                style={{ background: 'radial-gradient(ellipse at 30% 20%, var(--accent), transparent 70%)' }}/>
            </div>
            <div className="text-base font-semibold mb-1" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
              {webLLM.currentModel ? '开始对话' : '加载模型开始'}
            </div>
            <div className="text-sm max-w-sm leading-relaxed">
              {webLLM.currentModel
                ? `当前模型 ${webLLM.currentModel.name} · 已就绪，输入问题即可对话`
                : '从上方选择一个大模型，加载完成后即可开始本地 AI 对话。所有数据都在你的设备上运行。'}
            </div>
            {/* Quick prompts */}
            {webLLM.currentModel && (
              <div className="flex flex-wrap gap-2 mt-5 max-w-md justify-center">
                {['介绍一下 WebGPU 本地推理', '用 Python 写一个快速排序', '今天有哪些 AI 新闻？'].map((q, i) => (
                  <button key={i} onClick={() => { setMsgInput(q); inputRef.current?.focus(); }}
                    className="px-3 py-1.5 rounded-full text-xs transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >{q}</button>
                ))}
              </div>
            )}
            {!webLLM.currentModel && (
              <button
                onClick={() => setShowModelMenu(true)}
                className="mt-5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, var(--accent-deep), var(--accent))',
                  color: 'white',
                  boxShadow: 'var(--shadow-glow)',
                }}
              >
                选择模型 →
              </button>
            )}
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-1"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)' }}>
                {agent.activeAgent.icon}
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              {/* Reasoning content */}
              {msg.reasoningContent && (
                <div
                  className="text-xs px-3 py-1.5 rounded-t-xl border-l-2 mb-1"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                    borderLeftColor: 'var(--accent)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  <span className="font-medium" style={{ color: 'var(--accent-light)' }}>💭 思考过程：</span>
                  {(msg.reasoningContent || '').slice(0, 200)}
                  {(msg.reasoningContent || '').length > 200 ? '...' : ''}
                </div>
              )}
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
                  msg.role === 'user'
                    ? 'rounded-br-md'
                    : 'rounded-bl-md'
                }`}
                style={{
                  background: msg.role === 'user'
                    ? 'var(--accent-deep)'
                    : 'var(--bg-secondary)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  border: msg.role === 'assistant' ? '1px solid var(--border-subtle)' : 'none',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {msg.content}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-1"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                👤
              </div>
            )}
          </div>
        ))}

        {/* Streaming message */}
        {webLLM.isGenerating && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-1"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)' }}>
              {agent.activeAgent.icon}
            </div>
            <div className="max-w-[80%]">
              {webLLM.reasoningContent && (
                <div
                  className="text-xs px-3 py-1.5 rounded-t-xl border-l-2 mb-1"
                  style={{
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                    borderLeftColor: 'var(--accent)',
                  }}
                >
                  <span className="font-medium" style={{ color: 'var(--accent-light)' }}>💭 思考过程：</span>
                  {webLLM.reasoningContent}
                </div>
              )}
              <div
                className="px-4 py-2.5 rounded-2xl rounded-bl-md text-sm leading-relaxed"
                style={{
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {webLLM.streamingContent || (
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                    <span className="animate-pulse-dot inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)' }}/>
                    <span className="animate-pulse-dot inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', animationDelay: '0.2s' }}/>
                    <span className="animate-pulse-dot inline-block w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent)', animationDelay: '0.4s' }}/>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* === Input Area === */}
      <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={msgInput}
            onChange={e => setMsgInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={webLLM.currentModel ? '输入问题，Enter 发送，Shift+Enter 换行...' : '请先加载模型...'}
            disabled={!webLLM.currentModel || webLLM.isGenerating}
            rows={1}
            className="flex-1 px-4 py-3 rounded-xl text-sm resize-none outline-none transition-all duration-200"
            style={{
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-body)',
              maxHeight: '120px',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.1)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.boxShadow = 'none'; }}
            onInput={e => {
              const t = e.currentTarget;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 120) + 'px';
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!webLLM.currentModel || !msgInput.trim() || webLLM.isGenerating}
            className="px-5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: (webLLM.currentModel && msgInput.trim() && !webLLM.isGenerating)
                ? 'linear-gradient(135deg, var(--accent-deep), var(--accent))'
                : 'var(--bg-tertiary)',
              color: (webLLM.currentModel && msgInput.trim() && !webLLM.isGenerating) ? 'white' : 'var(--text-muted)',
              boxShadow: (webLLM.currentModel && msgInput.trim() && !webLLM.isGenerating) ? 'var(--shadow-glow)' : 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
            </svg>
            发送
          </button>
        </div>
        <div className="flex items-center gap-4 mt-2 px-1">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {webLLM.currentModel
              ? `${webLLM.currentModel.name} · ${webLLM.currentModel.size} · ${thinkingMode ? '思考模式' : '标准模式'}`
              : '尚未加载模型'}
          </span>
          <div className="flex-1"/>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
            100% 本地 · 数据不出设备
          </span>
        </div>
      </div>
    </div>
  );
}
