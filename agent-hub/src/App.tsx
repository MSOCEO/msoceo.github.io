// ============================================================
// Agent Hub - Main App
// ============================================================

import { useState, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ModelSwitcher } from './components/ModelSwitcher';
import { ChatPanel } from './components/ChatPanel';
import { SkillMarket } from './components/SkillMarket';
import { useWebLLM } from './hooks/useWebLLM';
import { useAgent } from './hooks/useAgent';
import { useSkillRegistry } from './hooks/useSkillRegistry';
import type { ModelEntry } from './types';

type View = 'chat' | 'models' | 'skills';

export default function App() {
  const [view, setView] = useState<View>('chat');
  const [showSidebar, setShowSidebar] = useState(true);

  const webLLM = useWebLLM();
  const agent = useAgent();
  const skillReg = useSkillRegistry();

  const handleModelSelect = useCallback(async (model: ModelEntry) => {
    await webLLM.loadModel(model);
    if (!agent.activeSession) {
      agent.createSession(agent.activeAgent.id, model.id);
    }
  }, [webLLM, agent]);

  return (
    <div className="flex h-full w-full bg-[var(--bg-primary)]">
      {/* Sidebar */}
      {showSidebar && (
        <Sidebar
          view={view}
          onViewChange={setView}
          sessions={agent.sessions}
          activeSession={agent.activeSession}
          onSessionSelect={agent.loadSession}
          onSessionDelete={agent.removeSession}
          onNewChat={() => setView('chat')}
          onClose={() => setShowSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-12 flex items-center gap-3 px-4 border-b border-[var(--border)] bg-[var(--bg-secondary)] shrink-0">
          {!showSidebar && (
            <button
              onClick={() => setShowSidebar(true)}
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--bg-tertiary)] text-[var(--text-secondary)] transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight">Agent Hub</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-bg)] text-[var(--accent-light)] font-medium">alpha</span>
          </div>

          {/* Agent Selector */}
          <div className="flex items-center gap-1 ml-6">
            {agent.agents.map(a => (
              <button
                key={a.id}
                onClick={() => agent.switchAgent(a.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all ${
                  agent.activeAgent.id === a.id
                    ? 'bg-[var(--accent-bg)] text-[var(--accent-light)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{a.icon}</span>
                <span className="hidden sm:inline">{a.name}</span>
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Model Status */}
          <button
            onClick={() => setView('models')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <span className={`w-2 h-2 rounded-full ${
              webLLM.loadState.status === 'ready' ? 'bg-[var(--success)]' :
              webLLM.loadState.status === 'downloading' || webLLM.loadState.status === 'loading' ? 'bg-[var(--warning)] animate-pulse-dot' :
              'bg-[var(--text-muted)]'
            }`} />
            {webLLM.currentModel?.name || '未加载模型'}
          </button>
        </header>

        {/* Content Area */}
        <main className="flex-1 flex min-h-0">
          {view === 'chat' && (
            <ChatPanel
              webLLM={webLLM}
              agent={agent}
              skillReg={skillReg}
            />
          )}
          {view === 'models' && (
            <ModelSwitcher
              loadState={webLLM.loadState}
              currentModel={webLLM.currentModel}
              onSelect={handleModelSelect}
              onUnload={webLLM.unloadModel}
            />
          )}
          {view === 'skills' && (
            <SkillMarket
              skillReg={skillReg}
            />
          )}
        </main>
      </div>
    </div>
  );
}
