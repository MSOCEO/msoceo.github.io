// ============================================================
// Agent Hub — Tool Catalog
// One-stop registry of all AI tools installable into the console.
// ============================================================

import type { ToolDefinition } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  'llm': 'LLM 对话',
  'image-gen': '文生图',
  'ui-gen': '图生 UI',
  'code': '代码 Agent',
  'voice': '语音',
  'video': '视频',
  'productivity': '效率工具',
};

export const TOOL_CATALOG: ToolDefinition[] = [
  // ========================
  // LLM 对话 — 已内置
  // ========================
  {
    id: 'lobe-chat',
    name: 'Lobe Chat',
    description: '多模型切换、插件市场与知识库，私有 AI 助手框架',
    icon: '🧠',
    category: 'llm',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:3210',
    cloudUrl: 'https://chat-preview.lobehub.com',
    docsUrl: 'https://github.com/lobehub/lobe-chat',
    requiresLocal: true,
    size: '~200 MB',
  },
  {
    id: 'open-webui',
    name: 'Open WebUI',
    description: '自托管 LLM 界面，兼容 Ollama/OpenAI API，功能丰富',
    icon: '🌐',
    category: 'llm',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:3000',
    docsUrl: 'https://github.com/open-webui/open-webui',
    requiresLocal: true,
    size: '~300 MB',
  },
  {
    id: 'ollama',
    name: 'Ollama',
    description: '一键本地运行 Llama/Qwen/DeepSeek 等开源模型',
    icon: '🦙',
    category: 'llm',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:11434',
    docsUrl: 'https://ollama.com',
    requiresLocal: true,
    size: '~200 MB',
  },
  {
    id: 'jan-ai',
    name: 'Jan AI',
    description: '开源离线 AI 桌面端，内置模型市场，开箱即用',
    icon: '💎',
    category: 'llm',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:1337',
    docsUrl: 'https://github.com/janhq/jan',
    requiresLocal: true,
    size: '~150 MB',
  },

  // ========================
  // 文生图
  // ========================
  {
    id: 'sd-webui',
    name: 'SD WebUI (AUTOMATIC1111)',
    description: '最主流的 Stable Diffusion 前端，ControlNet / LoRA / Inpainting 全支持',
    icon: '🎨',
    category: 'image-gen',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:7860',
    docsUrl: 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
    requiresLocal: true,
    size: '~8 GB',
  },
  {
    id: 'comfyui',
    name: 'ComfyUI',
    description: '节点式工作流图像生成，可视化连接模型管道，专业首选',
    icon: '🔮',
    category: 'image-gen',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:8188',
    docsUrl: 'https://github.com/comfyanonymous/ComfyUI',
    requiresLocal: true,
    size: '~5 GB',
  },
  {
    id: 'fooocus',
    name: 'Fooocus',
    description: '简化版 SDXL 前端，开箱即用，无需调参，快速出图',
    icon: '🖼️',
    category: 'image-gen',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:7865',
    docsUrl: 'https://github.com/lllyasviel/Fooocus',
    requiresLocal: true,
    size: '~5 GB',
  },
  {
    id: 'invokeai',
    name: 'InvokeAI',
    description: '专业级本地图像工作站，带节点编辑和统一画布',
    icon: '🖌️',
    category: 'image-gen',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:9090',
    docsUrl: 'https://github.com/invoke-ai/InvokeAI',
    requiresLocal: true,
    size: '~6 GB',
  },
  {
    id: 'krita-ai',
    name: 'Krita AI Diffusion',
    description: '开源绘画软件 Krita 的 AI 插件，实时绘画+AI 生成融合',
    icon: '✏️',
    category: 'image-gen',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:8888',
    docsUrl: 'https://github.com/Acly/krita-ai-diffusion',
    requiresLocal: true,
    size: '~3 GB',
  },

  // ========================
  // 图生 UI / 设计转代码
  // ========================
  {
    id: 'v0',
    name: 'v0 by Vercel',
    description: '文字/截图 → React + Tailwind 组件，一句话出 UI，业界标杆',
    icon: '⚡',
    category: 'ui-gen',
    tags: ['cloud', 'free-tier'],
    defaultUrl: 'https://v0.dev',
    docsUrl: 'https://v0.dev',
    requiresLocal: false,
  },
  {
    id: 'bolt-new',
    name: 'Bolt.new',
    description: '截图/描述 → 完整可运行 Web 应用，内置 StackBlitz 在线环境',
    icon: '🔩',
    category: 'ui-gen',
    tags: ['cloud', 'free-tier'],
    defaultUrl: 'https://bolt.new',
    docsUrl: 'https://bolt.new',
    requiresLocal: false,
  },
  {
    id: 'screenshot-to-code',
    name: 'Screenshot to Code',
    description: '上传截图 → 还原 HTML/React/Vue 代码，开源可本地运行',
    icon: '📸',
    category: 'ui-gen',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:5173',
    docsUrl: 'https://github.com/abi/screenshot-to-code',
    requiresLocal: true,
    size: '~300 MB',
  },
  {
    id: 'lovable',
    name: 'Lovable',
    description: 'AI 全栈应用构建器，描述即应用，支持 Supabase 集成',
    icon: '💝',
    category: 'ui-gen',
    tags: ['cloud', 'free-tier'],
    defaultUrl: 'https://lovable.dev',
    docsUrl: 'https://lovable.dev',
    requiresLocal: false,
  },

  // ========================
  // 代码 Agent
  // ========================
  {
    id: 'openhands',
    name: 'OpenHands (OpenDevin)',
    description: '全自主代码 Agent，操作浏览器+终端，完成完整编程任务',
    icon: '🤖',
    category: 'code',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:3001',
    docsUrl: 'https://github.com/All-Hands-AI/OpenHands',
    requiresLocal: true,
    size: '~500 MB',
  },
  {
    id: 'swe-agent',
    name: 'SWE-agent',
    description: '自动修复 GitHub Issues，可接入 Claude/GPT，SWE-bench 榜首',
    icon: '🐛',
    category: 'code',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:8080',
    docsUrl: 'https://github.com/princeton-nlp/SWE-agent',
    requiresLocal: true,
    size: '~200 MB',
  },
  {
    id: 'aider',
    name: 'Aider',
    description: '终端 AI 结对编程，直接编辑本地代码仓库，支持多模型',
    icon: '🛠️',
    category: 'code',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:8502',
    docsUrl: 'https://github.com/paul-gauthier/aider',
    requiresLocal: true,
    size: '~50 MB',
  },

  // ========================
  // 语音
  // ========================
  {
    id: 'whisper-webui',
    name: 'Whisper WebUI',
    description: '本地语音转文字，支持中文，基于 OpenAI Whisper，带 Web 界面',
    icon: '🎙️',
    category: 'voice',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:7860',
    docsUrl: 'https://github.com/jhj0517/Whisper-WebUI',
    requiresLocal: true,
    size: '~3 GB',
  },
  {
    id: 'openai-tts',
    name: 'OpenAI TTS',
    description: '高质量文字转语音，6 种自然声音，支持多语言',
    icon: '🔊',
    category: 'voice',
    tags: ['cloud', 'paid'],
    defaultUrl: 'https://platform.openai.com/docs/guides/text-to-speech',
    docsUrl: 'https://platform.openai.com/docs/guides/text-to-speech',
    requiresLocal: false,
  },

  // ========================
  // 视频
  // ========================
  {
    id: 'wan21',
    name: 'Wan 2.1',
    description: '阿里文生视频模型，本地部署，可生成高质量短视频',
    icon: '🎬',
    category: 'video',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:7860',
    docsUrl: 'https://github.com/Wan-Video/Wan2.1',
    requiresLocal: true,
    size: '~20 GB',
  },
  {
    id: 'comfyui-video',
    name: 'ComfyUI + AnimateDiff',
    description: 'ComfyUI 视频生成工作流，支持 AnimateDiff 动画扩散',
    icon: '🎞️',
    category: 'video',
    tags: ['local', 'open-source', 'free'],
    defaultUrl: 'http://localhost:8188',
    docsUrl: 'https://github.com/ Kosinkadink/ComfyUI-AnimateDiff-Evolved',
    requiresLocal: true,
    size: '~8 GB',
  },
];

export const CATEGORY_INFO: Record<string, { label: string; icon: string; color: string }> = {
  'llm':         { label: 'LLM 对话',   icon: '💬', color: '#8B5CF6' },
  'image-gen':   { label: '文生图',     icon: '🎨', color: '#EC4899' },
  'ui-gen':      { label: '图生 UI',    icon: '🪄', color: '#06B6D4' },
  'code':        { label: '代码 Agent', icon: '💻', color: '#10B981' },
  'voice':       { label: '语音',       icon: '🎙️', color: '#F59E0B' },
  'video':       { label: '视频',       icon: '🎬', color: '#EF4444' },
  'productivity':{ label: '效率工具',   icon: '⚙️', color: '#6366F1' },
};

export function getToolById(id: string): ToolDefinition | undefined {
  return TOOL_CATALOG.find(t => t.id === id);
}

export function getToolsByCategory(cat: string): ToolDefinition[] {
  return TOOL_CATALOG.filter(t => t.category === cat);
}
