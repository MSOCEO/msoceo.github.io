import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import ModelSwitcher from './components/ModelSwitcher';
import SkillMarket from './components/SkillMarket';
import HeroBrand from './components/HeroBrand';
import { useWebLLM } from './hooks/useWebLLM';
import { useAgent } from './hooks/useAgent';
import { useSkillRegistry } from './hooks/useSkillRegistry';

type View = 'chat' | 'models' | 'skills';

function App() {
  const [view, setView] = useState<View>('chat');
  const [showHero, setShowHero] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const webLLM = useWebLLM();
  const agent = useAgent();
  const skillReg = useSkillRegistry();

  useEffect(() => {
    agent.loadSessions();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('agent-hub-view');
    if (saved === 'models' || saved === 'skills') {
      setView(saved);
      setShowHero(false);
    }
  }, []);

  const handleViewChange = (v: View) => {
    setView(v);
    setShowHero(false);
    localStorage.setItem('agent-hub-view', v);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {sidebarOpen && (
        <Sidebar
          view={view}
          onViewChange={handleViewChange}
          sessions={agent.sessions}
          activeSession={agent.activeSession}
          onSessionSelect={(id) => agent.loadSession(id)}
          onSessionDelete={(id) => agent.removeSession(id)}
          onNewChat={() => agent.createSession(agent.activeAgent.id, webLLM.currentModel?.id || '')}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed top-3 left-3 z-20 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        )}
        {showHero && view === 'chat' && (
          <HeroBrand onDismiss={() => setShowHero(false)} />
        )}
        <div className="flex-1 overflow-hidden">
          {view === 'chat' && <ChatPanel webLLM={webLLM} agent={agent} skillReg={skillReg} />}
          {view === 'models' && <ModelSwitcher />}
          {view === 'skills' && <SkillMarket />}
        </div>
      </main>
    </div>
  );
}

export default App;
