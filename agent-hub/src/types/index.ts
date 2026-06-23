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

// Extended model types for non-text models in the console
export type ModelCategory = 'text' | 'image' | 'ui' | 'code' | 'voice' | 'video';

export interface ExternalModel {
  id: string;
  name: string;
  provider: string;
  category: ModelCategory;
  description: string;
  icon: string;          // emoji
  size?: string;
  requires: string[];     // tool IDs that can run this model
  tags: string[];
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
  | { status: 'downloading'; progress: number }
  | { status: 'loading' }
  | { status: 'ready' }
  | { status: 'error'; error: string };

// ============================================================
// App Store — Installable AI Tools
// ============================================================

export type ToolCategory = 'llm' | 'image-gen' | 'ui-gen' | 'code' | 'voice' | 'video' | 'productivity';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;            // emoji
  category: ToolCategory;
  tags: string[];           // 'local','cloud','open-source','free', etc.
  defaultUrl: string;       // local default URL (e.g. http://localhost:7860)
  cloudUrl?: string;        // optional cloud version URL
  docsUrl: string;          // GitHub / docs
  requiresLocal: boolean;   // needs local install
  size?: string;            // approx install size
}

export interface InstalledTool {
  toolId: string;
  customUrl?: string;       // user can override URL
  installedAt: number;
  isPinned: boolean;
}
