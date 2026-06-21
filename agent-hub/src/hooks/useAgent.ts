// ============================================================
// Agent Hub - Agent Management Hook
// ============================================================

import { useCallback, useState } from 'react';
import type { AgentConfig, ConversationSession, ChatMessage } from '../types';
import { BUILTIN_AGENTS, getAgentById } from '../lib/agents';
import { saveConversation, getConversation, listConversations, deleteConversation } from '../lib/db';

export function useAgent() {
  const [agents] = useState<AgentConfig[]>(BUILTIN_AGENTS);
  const [activeAgent, setActiveAgent] = useState<AgentConfig>(BUILTIN_AGENTS[0]);
  const [sessions, setSessions] = useState<ConversationSession[]>([]);
  const [activeSession, setActiveSession] = useState<ConversationSession | null>(null);

  const switchAgent = useCallback((agentId: string) => {
    const agent = getAgentById(agentId);
    if (agent) {
      setActiveAgent(agent);
      setActiveSession(null);
    }
  }, []);

  const createSession = useCallback((agentId: string, modelId: string) => {
    const session: ConversationSession = {
      id: crypto.randomUUID(),
      title: '新对话',
      agentId,
      modelId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setActiveSession(session);
    return session;
  }, []);

  const loadSessions = useCallback(async () => {
    const list = await listConversations();
    setSessions(list);
  }, []);

  const loadSession = useCallback(async (id: string) => {
    const session = await getConversation(id);
    if (session) {
      setActiveSession(session);
    }
  }, []);

  const addMessage = useCallback(async (session: ConversationSession, msg: ChatMessage) => {
    const updated: ConversationSession = {
      ...session,
      messages: [...session.messages, msg],
      title: session.messages.length === 0 && msg.role === 'user'
        ? msg.content.slice(0, 30) + (msg.content.length > 30 ? '...' : '')
        : session.title,
      updatedAt: Date.now(),
    };
    setActiveSession(updated);
    await saveConversation(updated);
    return updated;
  }, []);

  const removeSession = useCallback(async (id: string) => {
    await deleteConversation(id);
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSession?.id === id) {
      setActiveSession(null);
    }
  }, [activeSession]);

  return {
    agents,
    activeAgent,
    switchAgent,
    sessions,
    activeSession,
    setActiveSession,
    createSession,
    loadSessions,
    loadSession,
    addMessage,
    removeSession,
  };
}
