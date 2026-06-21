// ============================================================
// Agent Hub - Model Registry
// All models run locally via WebLLM in the browser.
// Quantized versions for practical browser usage.
// ============================================================

import type { ModelEntry } from '../types';

export const MODEL_REGISTRY: ModelEntry[] = [
  // ---- Small / Fast Models ----
  {
    id: 'gemma-3-270m',
    name: 'Gemma 3 270M',
    provider: 'Google',
    size: '180 MB',
    quantization: 'q4',
    engine: 'WebLLM',
    modelId: 'gemma-3-270m-it-q4f16_1-MLC',
    description: '超轻量级，秒级响应，适合简单问答和低配设备',
    contextLength: 4096,
    tags: ['fast', 'chat'],
    builtinTools: [],
  },
  {
    id: 'phi-3-mini',
    name: 'Phi-3 Mini',
    provider: 'Microsoft',
    size: '2.2 GB',
    quantization: 'q4',
    engine: 'WebLLM',
    modelId: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
    description: '微软轻量模型，推理能力强，适合中英文对话',
    contextLength: 4096,
    tags: ['chat', 'reasoning'],
    builtinTools: [],
  },

  // ---- Balanced Models ----
  {
    id: 'llama-3.1-8b',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    size: '4.8 GB',
    quantization: 'q4',
    engine: 'WebLLM',
    modelId: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
    description: 'Meta 旗舰开源模型，综合能力出色，支持 function calling',
    contextLength: 8192,
    tags: ['chat', 'code', 'reasoning'],
    builtinTools: ['function-calling'],
  },
  {
    id: 'qwen2.5-7b',
    name: 'Qwen 2.5 7B',
    provider: 'Alibaba',
    size: '4.3 GB',
    quantization: 'q4',
    engine: 'WebLLM',
    modelId: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
    description: '阿里通义千问，中文能力突出，编程和推理俱佳',
    contextLength: 8192,
    tags: ['chat', 'code', 'reasoning'],
    builtinTools: ['function-calling'],
  },

  // ---- Large / Specialized ----
  {
    id: 'deepseek-r1-distill',
    name: 'DeepSeek R1 Distill 7B',
    provider: 'DeepSeek',
    size: '4.5 GB',
    quantization: 'q4',
    engine: 'WebLLM',
    modelId: 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC',
    description: '深度求索推理模型蒸馏版，数学/逻辑推理极强',
    contextLength: 8192,
    tags: ['reasoning'],
    builtinTools: [],
  },
  {
    id: 'hermes-2-pro',
    name: 'Hermes 2 Pro 8B',
    provider: 'Nous Research',
    size: '4.8 GB',
    quantization: 'q4',
    engine: 'WebLLM',
    modelId: 'Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC',
    description: '专为 function-calling 优化的模型，工具调用精准',
    contextLength: 8192,
    tags: ['chat', 'code'],
    builtinTools: ['function-calling'],
  },
];

export function getModelById(id: string): ModelEntry | undefined {
  return MODEL_REGISTRY.find(m => m.id === id);
}

export function getModelsByTag(tag: string): ModelEntry[] {
  return MODEL_REGISTRY.filter(m => m.tags.includes(tag));
}

export function getRecommendedModel(): ModelEntry {
  return MODEL_REGISTRY.find(m => m.id === 'qwen2.5-7b') || MODEL_REGISTRY[2];
}
