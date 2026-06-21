// ============================================================
// Agent Hub - Chat Panel
// ============================================================

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

  // Auto-scroll
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
        content: `发生错误: ${message}`,
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

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!session && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-[var(--accent-bg)] flex items-center justify-center mb-4">
              <span className="text-2xl">{agent.activeAgent.icon}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{agent.activeAgent.name}</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-sm">{agent.activeAgent.description}</p>
            <p className="text-xs text-[var(--text-muted)] mt-4">
              加载模型后即可开始对话
            </p>
          </div>
        )}

        {isLoading && !session?.messages.length && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin mb-4" />
            <p className="text-sm text-[var(--text-secondary)]">
              {webLLM.loadState.status === 'downloading' ? `下载模型中... ${Math.round((webLLM.loadState as {progress: number}).progress * 100)}%` : '加载模型中...'}
            </p>
          </div>
        )}

        {session?.messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} icon={agent.activeAgent.icon} />
        ))}

        {webLLM.isGenerating && streamingContent && (
          <div className="flex gap-3 animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-[var(--accent-bg)] flex items-center justify-center text-sm shrink-0 mt-0.5">
              {agent.activeAgent.icon}
            </div>
            <div className="flex-1 min-w-0">
              {reasoningContent && (
                <div className="mb-2">
                  <button
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors mb-1"
                  >
                    {showReasoning ? '收起思考' : '查看思考过程'} 
                  </button>
                  {showReasoning && (
                    <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-xs text-[var(--text-muted)] whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto mb-2">
                      {reasoningContent}
                    </div>
                  )}
                </div>
              )}
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{streamingContent}</div>
              <span className="inline-block w-1.5 h-4 ml-0.5 bg-[var(--accent)] animate-pulse rounded-sm align-middle" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-[var(--border)] bg-[var(--bg-secondary)] p-3">
        {/* Active Skills Indicator */}
        {skillReg.activeSkills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5 px-1">
            {skillReg.activeSkills.map(id => {
              const skill = skillReg.skills.find(s => s.id === id);
              if (!skill) return null;
              return (
                <span key={id} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-tertiary)] text-[10px] text-[var(--text-secondary)]">
                  {skill.icon} {skill.name}
                </span>
              );
            })}
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading || webLLM.isGenerating}
            placeholder={isLoading ? '请先加载模型...' : '输入消息...'}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border)] text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || webLLM.isGenerating || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-all shrink-0"
          >
            {webLLM.isGenerating ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
                思考中
              </span>
            ) : '发送'}
          </button>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1.5 px-1">
          所有对话在浏览器本地处理，数据不会上传到任何服务器
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ msg, icon }: { msg: ChatMessage; icon: string }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0 mt-0.5 ${
        isUser ? 'bg-[var(--bg-tertiary)]' : 'bg-[var(--accent-bg)]'
      }`}>
        {isUser ? '👤' : icon}
      </div>
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block text-sm leading-relaxed whitespace-pre-wrap px-4 py-2.5 rounded-2xl ${
          isUser
            ? 'bg-[var(--accent)] text-white rounded-tr-md'
            : 'bg-[var(--bg-card)] text-[var(--text-primary)] rounded-tl-md'
        }`}>
          {msg.content}
        </div>
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.toolCalls.map(tc => (
              <span key={tc.id} className="px-2 py-1 rounded-md bg-[var(--bg-tertiary)] text-[10px] text-[var(--text-muted)]">
                🔧 {tc.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
