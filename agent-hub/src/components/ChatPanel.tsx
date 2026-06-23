import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../types';
import { useWebLLM } from '../hooks/useWebLLM';
import { useAgent } from '../hooks/useAgent';
import { useSkillRegistry } from '../hooks/useSkillRegistry';

interface ChatPanelProps {
  webLLM: ReturnType<typeof useWebLLM>;
  agent: ReturnType<typeof useAgent>;
  skillReg: ReturnType<typeof useSkillRegistry>;
}

export function ChatPanel({ webLLM, agent, skillReg }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [showReasoning, setShowReasoning] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const session = agent.activeSession;
  const isLoading = webLLM.loadState.status !== 'ready';
  const { streamingContent, reasoningContent } = webLLM;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages, streamingContent]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !webLLM.currentModel || webLLM.isGenerating) return;

    let currentSession = agent.activeSession;
    if (!currentSession) {
      currentSession = agent.createSession(agent.activeAgent.id, webLLM.currentModel.id);
    }

    setInput('');
    setShowReasoning(false);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    const sessionWithUser = await agent.addMessage(currentSession, userMsg);

    try {
      const assistantMsg = await webLLM.sendMessage(
        text,
        sessionWithUser.messages.filter(m => m.role !== 'system'),
        skillReg.activeSkills,
        agent.activeAgent.systemPrompt,
      );
      await agent.addMessage(sessionWithUser, assistantMsg);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `错误: ${message}`,
        timestamp: Date.now(),
      };
      await agent.addMessage(sessionWithUser, errorMsg);
    }
  }, [input, webLLM, agent, skillReg]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 空状态 — 图形化
  if (!session && !isLoading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 animate-view-enter">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* 浮动 Logo */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-2xl blur-xl opacity-30 animate-glow-pulse"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--cyan))' }} />
            <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center animate-float"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #8B5CF6, #06B6D4)',
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.3)',
              }}>
              <span className="text-3xl select-none">{agent.activeAgent.icon}</span>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            {agent.activeAgent.name}
          </h2>
          <p className="text-sm text-center max-w-sm mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {agent.activeAgent.description}
          </p>

          {/* 快捷提问 */}
          <div className="grid grid-cols-1 gap-2 w-full max-w-md">
            <QuickPrompt onClick={() => setInput('你能帮我做什么？')} color="#8B5CF6">
              <span className="text-base">💡</span>
              你能帮我做什么？
            </QuickPrompt>
            <QuickPrompt onClick={() => setInput('介绍一下 WebLLM 的工作原理')} color="#06B6D4">
              <span className="text-base">🧠</span>
              介绍一下 WebLLM 的工作原理
            </QuickPrompt>
            <QuickPrompt onClick={() => setInput('帮我写一段代码')} color="#10B981">
              <span className="text-base">💻</span>
              帮我写一段代码
            </QuickPrompt>
          </div>
        </div>

        <ChatInput
          input={input} setInput={setInput} onSend={handleSend} onKeyDown={handleKeyDown}
          isLoading={isLoading} isGenerating={false} skillReg={skillReg} inputRef={inputRef}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 加载状态 */}
      {isLoading && !session?.messages.length && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative w-16 h-16 mb-5">
            <div className="absolute inset-0 rounded-2xl animate-spin-slow opacity-40"
              style={{ background: 'conic-gradient(var(--accent), var(--cyan), var(--accent))', filter: 'blur(10px)' }} />
            <div className="absolute inset-[2px] rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--bg-root)' }}>
              <span className="text-2xl">{agent.activeAgent.icon}</span>
            </div>
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            正在加载模型
          </p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {webLLM.loadState.status === 'downloading'
              ? `下载中... ${Math.round((webLLM.loadState as {progress: number}).progress * 100)}%`
              : '初始化引擎...'}
          </p>
          {webLLM.loadState.status === 'downloading' && (
            <div className="mt-4 w-56 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  background: 'linear-gradient(90deg, var(--accent), var(--cyan))',
                  width: `${Math.round((webLLM.loadState as {progress: number}).progress * 100)}%`,
                }} />
            </div>
          )}
        </div>
      )}

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-5">
          {session?.messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} icon={agent.activeAgent.icon} />
          ))}

          {webLLM.isGenerating && streamingContent && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mt-1"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
                  boxShadow: '0 0 16px rgba(139, 92, 246, 0.25)',
                }}>
                <span className="text-base">{agent.activeAgent.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                {reasoningContent && (
                  <div className="mb-3">
                    <button
                      onClick={() => setShowReasoning(!showReasoning)}
                      className="text-[11px] font-medium mb-1.5 flex items-center gap-1.5 transition-colors hover:opacity-80"
                      style={{ color: 'var(--text-muted)' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className={`transition-transform duration-200 ${showReasoning ? 'rotate-90' : ''}`}>
                        <path d="M9 18l6-6-6-6"/>
                      </svg>
                      {showReasoning ? '收起推理' : '查看推理'}
                    </button>
                    {showReasoning && (
                      <div className="p-3 rounded-xl text-xs whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto mb-3 animate-slide-down"
                        style={{
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border-subtle)',
                          fontFamily: 'var(--font-mono)',
                        }}>
                        {reasoningContent}
                      </div>
                    )}
                  </div>
                )}
                <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>
                  {streamingContent}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="inline-block w-1.5 h-4 rounded-sm animate-pulse" style={{ background: 'var(--accent)' }} />
                  <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    生成中
                    <span className="inline-flex gap-0.5">
                      <span className="w-1 h-1 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)' }} />
                      <span className="w-1 h-1 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)', animationDelay: '0.2s' }} />
                      <span className="w-1 h-1 rounded-full animate-pulse-dot" style={{ background: 'var(--accent)', animationDelay: '0.4s' }} />
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        input={input} setInput={setInput} onSend={handleSend} onKeyDown={handleKeyDown}
        isLoading={isLoading} isGenerating={webLLM.isGenerating} skillReg={skillReg} inputRef={inputRef}
      />
    </div>
  );
}

function ChatInput({
  input, setInput, onSend, onKeyDown, isLoading, isGenerating, skillReg, inputRef,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  isGenerating: boolean;
  skillReg: ReturnType<typeof useSkillRegistry>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="border-t px-4 py-3" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
      <div className="max-w-3xl mx-auto">
        {/* 激活的插件 */}
        {skillReg.activeSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {skillReg.activeSkills.map(id => {
              const skill = skillReg.skills.find(s => s.id === id);
              if (!skill) return null;
              return (
                <span key={id} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent-light)', border: '1px solid var(--border-accent)' }}>
                  {skill.icon} {skill.name}
                </span>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              disabled={isLoading || isGenerating}
              placeholder={isLoading ? '请先加载模型...' : '输入问题，按 Enter 发送...'}
              className="w-full px-4 py-3 rounded-2xl text-sm transition-all duration-200 disabled:opacity-40"
              style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.15)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            onClick={onSend}
            disabled={isLoading || isGenerating || !input.trim()}
            className="px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 disabled:opacity-30 active:scale-95 shrink-0 relative overflow-hidden group"
            style={{ color: '#fff' }}>
            <div className="absolute inset-0 rounded-2xl"
              style={{
                background: input.trim() ? 'linear-gradient(135deg, #7C3AED, #8B5CF6, #06B6D4)' : 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
                backgroundSize: input.trim() ? '200% 200%' : '100% 100%',
                animation: input.trim() ? 'gradient-flow 3s ease infinite' : 'none',
              }} />
            {input.trim() && (
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent)' }} />
            )}
            {isGenerating ? (
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                等待
              </span>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="relative z-10">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
            )}
          </button>
        </div>

        <p className="text-[10px] mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
          全部在本地处理 · 数据永不离开设备
        </p>
      </div>
    </div>
  );
}

function QuickPrompt({ children, onClick, color }: { children: React.ReactNode; onClick: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs text-left transition-all duration-200 group"
      style={{
        background: 'var(--bg-card)',
        color: 'var(--text-secondary)',
        border: '1px solid var(--border-subtle)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}40`;
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.transform = 'translateX(4px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.transform = 'translateX(0)';
      }}
    >
      {children}
    </button>
  );
}

function MessageBubble({ msg, icon }: { msg: ChatMessage; icon: string }) {
  const isUser = msg.role === 'user';
  const time = new Date(msg.timestamp);
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0 mt-0.5 ${
        isUser ? 'bg-[var(--bg-tertiary)]' : ''
      }`}
        style={isUser ? {} : {
          background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
          boxShadow: '0 0 12px rgba(139, 92, 246, 0.2)',
        }}>
        {isUser ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            style={{ color: 'var(--text-muted)' }}>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        ) : (
          <span>{icon}</span>
        )}
      </div>
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block text-sm leading-relaxed whitespace-pre-wrap px-4 py-3 rounded-2xl ${
          isUser ? 'rounded-tr-md text-white' : 'rounded-tl-md'
        }`}
          style={isUser ? {
            background: 'linear-gradient(135deg, #7C3AED, #8B5CF6)',
          } : {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-subtle)',
          }}>
          {msg.content}
        </div>

        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 justify-end">
            {msg.toolCalls.map(tc => (
              <span key={tc.id} className="px-2 py-1 rounded-lg text-[10px] font-medium inline-flex items-center gap-1"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
                {tc.name}
              </span>
            ))}
          </div>
        )}

        <div className={`text-[10px] mt-1 ${isUser ? 'text-right' : ''}`} style={{ color: 'var(--text-muted)' }}>
          {timeStr}
        </div>
      </div>
    </div>
  );
}
