// ============================================================
// Agent Hub - Type Definitions
// ============================================================

export interface ModelEntry {
  id: string;
  name: string;
  provider: string;
  size: string;
  quantization: 'q4' | 'q8';
  engine: 'WebLLM' | 'Agentary';
  modelId: string; // WebLLM model identifier
  description: string;
  contextLength: number;
  tags: string[]; // 'chat', 'code', 'reasoning', 'fast'
  builtinTools?: string[]; // tool names this model supports natively
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  category: 'search' | 'file' | 'code' | 'media' | 'productivity' | 'custom';
  parameters: SkillParameter[];
  execute: string; // JavaScript function body (eval'd in sandbox)
  requiresApiKey?: boolean;
  isBuiltin: boolean;
}

export interface SkillParameter {
  name: string;
  type: 'string' | 'number' | 'boolean';
  description: string;
  required: boolean;
  default?: string | number | boolean;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  systemPrompt: string;
  defaultModel: string; // ModelEntry.id
  skills: string[]; // SkillDefinition.id[]
  temperature: number;
  maxTokens: number;
  workspaceFiles?: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  timestamp: number;
  agentId?: string;
  modelId?: string;
  toolCalls?: ToolCall[];
  reasoningContent?: string;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: string;
}

export interface ConversationSession {
  id: string;
  title: string;
  agentId: string;
  modelId: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

export type ModelLoadState = 
  | { status: 'idle' }
  | { status: 'downloading'; progress: number; loaded: number; total: number }
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; error: string };
