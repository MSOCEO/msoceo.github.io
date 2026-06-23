// ============================================================
// Agent Hub — External Model Registry
// Non-WebLLM models that run through installed tools.
// ============================================================

import type { ExternalModel } from '../types';

export const EXTERNAL_MODELS: ExternalModel[] = [
  // ========================
  // 图像生成模型
  // ========================
  {
    id: 'sdxl',
    name: 'SDXL 1.0',
    provider: 'Stability AI',
    category: 'image',
    description: '1024×1024 高分辨率文生图，细节丰富',
    icon: '🎨',
    size: '~7 GB',
    requires: ['sd-webui', 'comfyui', 'fooocus'],
    tags: ['文生图', '高画质'],
  },
  {
    id: 'sd3',
    name: 'Stable Diffusion 3',
    provider: 'Stability AI',
    category: 'image',
    description: '最新 SOTA 文生图模型，文字渲染能力大幅提升',
    icon: '🖼️',
    size: '~12 GB',
    requires: ['sd-webui', 'comfyui'],
    tags: ['文生图', '多模态', '最新'],
  },
  {
    id: 'flux-dev',
    name: 'FLUX.1 Dev',
    provider: 'Black Forest Labs',
    category: 'image',
    description: '当前最强的开源文生图模型之一，照片级写实',
    icon: '📷',
    size: '~24 GB',
    requires: ['comfyui'],
    tags: ['文生图', '写实', '顶级'],
  },
  {
    id: 'sdxl-turbo',
    name: 'SDXL Turbo',
    provider: 'Stability AI',
    category: 'image',
    description: '实时文生图，单步生成，速度极快',
    icon: '⚡',
    size: '~7 GB',
    requires: ['sd-webui', 'comfyui'],
    tags: ['文生图', '实时', '快速'],
  },
  {
    id: 'sdxl-controlnet',
    name: 'SDXL + ControlNet',
    provider: 'Community',
    category: 'image',
    description: '精确控制构图，支持线稿、深度图、姿态等多种条件',
    icon: '🎯',
    size: '~10 GB',
    requires: ['sd-webui', 'comfyui'],
    tags: ['图生图', '控制', '精准'],
  },

  // ========================
  // UI 生成模型
  // ========================
  {
    id: 'v0-model',
    name: 'v0 AI Model',
    provider: 'Vercel',
    category: 'ui',
    description: '文字描述 → React + Tailwind 组件代码',
    icon: '⚡',
    requires: ['v0'],
    tags: ['云端', 'React', 'Tailwind'],
  },
  {
    id: 'bolt-model',
    name: 'Bolt.new Engine',
    provider: 'StackBlitz',
    category: 'ui',
    description: '截图/描述 → 完整可运行 Web 应用',
    icon: '🔩',
    requires: ['bolt-new'],
    tags: ['云端', '全栈', '即时预览'],
  },
  {
    id: 'gpt4-vision',
    name: 'GPT-4V / GPT-4o',
    provider: 'OpenAI',
    category: 'ui',
    description: '上传设计稿截图 → 生成 HTML/CSS/React 代码（需 API Key）',
    icon: '👁️',
    requires: ['screenshot-to-code'],
    tags: ['云端', '视觉理解', '多模态'],
  },

  // ========================
  // 代码模型
  // ========================
  {
    id: 'claude-code',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: 'code',
    description: '最强代码生成模型之一，SWE-bench 验证',
    icon: '💻',
    requires: ['openhands', 'swe-agent', 'aider'],
    tags: ['云端', '代码', 'Agent'],
  },
  {
    id: 'deepseek-coder',
    name: 'DeepSeek Coder V2',
    provider: 'DeepSeek',
    category: 'code',
    description: '开源代码模型，支持 338 种语言，上下文 128K',
    icon: '🐋',
    size: '~16 GB',
    requires: ['openhands', 'aider'],
    tags: ['开源', '代码', '长上下文'],
  },

  // ========================
  // 语音模型
  // ========================
  {
    id: 'whisper-large-v3',
    name: 'Whisper Large v3',
    provider: 'OpenAI',
    category: 'voice',
    description: '最强开源语音识别，支持 100+ 语言',
    icon: '🎙️',
    size: '~3 GB',
    requires: ['whisper-webui'],
    tags: ['语音转文字', '多语言', '开源'],
  },
  {
    id: 'whisper-medium',
    name: 'Whisper Medium',
    provider: 'OpenAI',
    category: 'voice',
    description: '平衡精度与速度，适合日常语音转文字',
    icon: '🎤',
    size: '~1.5 GB',
    requires: ['whisper-webui'],
    tags: ['语音转文字', '快速', '平衡'],
  },

  // ========================
  // 视频模型
  // ========================
  {
    id: 'wan21-14b',
    name: 'Wan 2.1 14B',
    provider: 'Alibaba',
    category: 'video',
    description: '阿里文生视频大模型，支持中英文',
    icon: '🎬',
    size: '~20 GB',
    requires: ['wan21'],
    tags: ['文生视频', '中文', '高质量'],
  },
  {
    id: 'animatediff',
    name: 'AnimateDiff v3',
    provider: 'Community',
    category: 'video',
    description: '将静态 SD 模型转为动画生成器，运动控制精准',
    icon: '🎞️',
    size: '~3 GB',
    requires: ['comfyui-video'],
    tags: ['图生视频', '动画', '运动控制'],
  },
];

// Group by category
export const IMAGE_MODELS = EXTERNAL_MODELS.filter(m => m.category === 'image');
export const UI_MODELS = EXTERNAL_MODELS.filter(m => m.category === 'ui');
export const CODE_MODELS = EXTERNAL_MODELS.filter(m => m.category === 'code');
export const VOICE_MODELS = EXTERNAL_MODELS.filter(m => m.category === 'voice');
export const VIDEO_MODELS = EXTERNAL_MODELS.filter(m => m.category === 'video');

export function getExternalModelById(id: string): ExternalModel | undefined {
  return EXTERNAL_MODELS.find(m => m.id === id);
}
