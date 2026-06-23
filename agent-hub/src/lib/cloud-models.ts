// ============================================================
// Agent Hub — Cloud Model Registry
// OpenAI-compatible cloud models (streaming supported)
// ============================================================

import type { CloudModelConfig } from './cloud-api';

export interface CloudModel {
  id: string;
  name: string;
  provider: string;
  providerId: string;     // key in cloud-api settings
  modelId: string;        // actual model ID sent to API
  description: string;
  icon: string;
  contextLength: number;
  tags: string[];
  suggestedEndpoint?: string;  // default API endpoint
  apiKeyPlaceholder?: string;
}

export const CLOUD_PROVIDERS: Record<string, { name: string; defaultEndpoint: string; docsUrl: string }> = {
  'openai': {
    name: 'OpenAI',
    defaultEndpoint: 'https://api.openai.com/v1',
    docsUrl: 'https://platform.openai.com/docs',
  },
  'deepseek': {
    name: 'DeepSeek',
    defaultEndpoint: 'https://api.deepseek.com/v1',
    docsUrl: 'https://platform.deepseek.com/docs',
  },
  'anthropic': {
    name: 'Anthropic (OpenRouter)',
    defaultEndpoint: 'https://openrouter.ai/api/v1',
    docsUrl: 'https://openrouter.ai/docs',
  },
  'google': {
    name: 'Google Gemini',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta/openai',
    docsUrl: 'https://ai.google.dev/docs',
  },
  'openrouter': {
    name: 'OpenRouter',
    defaultEndpoint: 'https://openrouter.ai/api/v1',
    docsUrl: 'https://openrouter.ai/docs',
  },
  'custom': {
    name: '自定义端点',
    defaultEndpoint: '',
    docsUrl: '',
  },
};

export const CLOUD_MODELS: CloudModel[] = [
  // ─── OpenAI ───
  {
    id: 'cloud-gpt4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    providerId: 'openai',
    modelId: 'gpt-4o',
    description: 'OpenAI 最新多模态模型，支持文本、图像、语音',
    icon: '🤖',
    contextLength: 128000,
    tags: ['多模态', '云端', '最快'],
    suggestedEndpoint: 'https://api.openai.com/v1',
    apiKeyPlaceholder: 'sk-...',
  },
  {
    id: 'cloud-gpt4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    providerId: 'openai',
    modelId: 'gpt-4o-mini',
    description: 'GPT-4o 的轻量版，速度快、成本低',
    icon: '⚡',
    contextLength: 128000,
    tags: ['多模态', '云端', '快速', '经济'],
    suggestedEndpoint: 'https://api.openai.com/v1',
    apiKeyPlaceholder: 'sk-...',
  },
  {
    id: 'cloud-o3-mini',
    name: 'O3-Mini',
    provider: 'OpenAI',
    providerId: 'openai',
    modelId: 'o3-mini',
    description: 'OpenAI 推理模型，擅长代码和逻辑',
    icon: '🧠',
    contextLength: 128000,
    tags: ['推理', '代码', '云端'],
    suggestedEndpoint: 'https://api.openai.com/v1',
    apiKeyPlaceholder: 'sk-...',
  },

  // ─── DeepSeek ───
  {
    id: 'cloud-deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    providerId: 'deepseek',
    modelId: 'deepseek-chat',
    description: 'DeepSeek 主力模型，性价比极高',
    icon: '🐋',
    contextLength: 64000,
    tags: ['代码', '云端', '经济'],
    suggestedEndpoint: 'https://api.deepseek.com/v1',
    apiKeyPlaceholder: 'sk-...',
  },
  {
    id: 'cloud-deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    providerId: 'deepseek',
    modelId: 'deepseek-reasoner',
    description: 'DeepSeek 推理模型，展示完整思维链',
    icon: '🔗',
    contextLength: 64000,
    tags: ['推理', '思维链', '云端'],
    suggestedEndpoint: 'https://api.deepseek.com/v1',
    apiKeyPlaceholder: 'sk-...',
  },

  // ─── Anthropic via OpenRouter ───
  {
    id: 'cloud-claude-sonnet4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    providerId: 'openrouter',
    modelId: 'anthropic/claude-sonnet-4',
    description: 'Anthropic 最新 Sonnet，平衡性能与成本',
    icon: '💫',
    contextLength: 200000,
    tags: ['代码', '写作', '云端'],
    suggestedEndpoint: 'https://openrouter.ai/api/v1',
    apiKeyPlaceholder: 'sk-or-...',
  },
  {
    id: 'cloud-claude-opus4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    providerId: 'openrouter',
    modelId: 'anthropic/claude-opus-4',
    description: 'Anthropic 最强模型，顶级推理和代码能力',
    icon: '💎',
    contextLength: 200000,
    tags: ['最强', '代码', '云端'],
    suggestedEndpoint: 'https://openrouter.ai/api/v1',
    apiKeyPlaceholder: 'sk-or-...',
  },

  // ─── Google Gemini ───
  {
    id: 'cloud-gemini-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    providerId: 'google',
    modelId: 'gemini-2.0-flash',
    description: 'Google 最快模型，免费额度高',
    icon: '💨',
    contextLength: 1000000,
    tags: ['快速', '大上下文', '免费额度'],
    suggestedEndpoint: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKeyPlaceholder: 'AIza...',
  },
  {
    id: 'cloud-gemini-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    providerId: 'google',
    modelId: 'gemini-2.5-pro-preview-03-25',
    description: 'Google 最强推理模型',
    icon: '💎',
    contextLength: 1000000,
    tags: ['推理', '大上下文', '云端'],
    suggestedEndpoint: 'https://generativelanguage.googleapis.com/v1beta/openai',
    apiKeyPlaceholder: 'AIza...',
  },
];

export function getCloudModelById(id: string): CloudModel | undefined {
  return CLOUD_MODELS.find(m => m.id === id);
}

export function getCloudModelsByProvider(providerId: string): CloudModel[] {
  return CLOUD_MODELS.filter(m => m.providerId === providerId);
}
