import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatPanel } from './components/ChatPanel';
import ModelSwitcher from './components/ModelSwitcher';
import SkillMarket from './components/SkillMarket';
import ToolStore from './components/ToolStore';
import Dashboard from './components/Dashboard';
import HeroBrand from './components/HeroBrand';
import { useWebLLM } from './hooks/useWebLLM';
import { useAgent } from './hooks/useAgent';
import { useSkillRegistry } from './hooks/useSkillRegistry';
import { useToolRegistry } from './hooks/useToolRegistry';

type View = 'dashboard' | 'chat' | 'models' | 'skills' | 'store';

function App() {
  const [view, setView] = useState<View>('dashboard');
  const [showHero, setShowHero] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewKey, setViewKey] = useState(0);

  const webLLM = useWebLLM();
  const agent = useAgent();
  const skillReg = useSkillRegistry();
  const toolReg = useToolRegistry();

  useEffect(() => {
    agent.loadSessions();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('agent-hub-view');
    if (saved === 'chat' || saved === 'models' || saved === 'skills' || saved === 'store') {
      setView(saved);
      setShowHero(false);
    }
  }, []);

  const handleViewChange = (v: View) => {
    setView(v);
    setShowHero(false);
    setViewKey(k => k + 1);
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
            className="fixed top-3 left-3 z-20 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-md)',
              color: 'var(--text-muted)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
            </svg>
          </button>
        )}
        {showHero && view === 'dashboard' && (
          <HeroBrand onDismiss={() => setShowHero(false)} />
        )}
        <div className="flex-1 overflow-hidden" key={viewKey}>
          {view === 'dashboard' && <Dashboard />}
          {view === 'chat' && <ChatPanel webLLM={webLLM} agent={agent} skillReg={skillReg} />}
          {view === 'models' && <ModelSwitcher />}
          {view === 'skills' && <SkillMarket />}
          {view === 'store' && <ToolStore />}
        </div>
      </main>
    </div>
  );
}

export default App;
