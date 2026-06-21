// ============================================================
// Agent Hub - Agent Configurations
// ============================================================

import type { AgentConfig } from '../types';

export const BUILTIN_AGENTS: AgentConfig[] = [
  {
    id: 'general',
    name: '通用助手',
    description: '全能型 AI 助手，处理各类日常任务',
    icon: '🤖',
    systemPrompt: '你是一个有帮助的 AI 助手，用中文回答用户问题。回答简洁专业，必要时使用 Markdown 格式组织内容。',
    defaultModel: 'qwen2.5-7b',
    skills: ['web-search', 'time-date', 'calculator', 'weather', 'url-fetch'],
    temperature: 0.7,
    maxTokens: 2048,
  },
  {
    id: 'coder',
    name: '编程助手',
    description: '专注代码编写、调试和技术问答',
    icon: '💻',
    systemPrompt: '你是一个专业的编程助手。用中文交流，代码注释可中英文混合。给出完整可运行的代码方案，包含必要的错误处理和类型定义。优先使用现代最佳实践。',
    defaultModel: 'llama-3.1-8b',
    skills: ['code-runner', 'web-search', 'calculator', 'url-fetch'],
    temperature: 0.3,
    maxTokens: 4096,
  },
  {
    id: 'writer',
    name: '写作伙伴',
    description: '文案撰写、润色、翻译和创意写作',
    icon: '✍️',
    systemPrompt: '你是一个文采斐然的写作助手。用中文写作，风格灵活可调。擅长文案润色、创意写作、翻译和内容策划。',
    defaultModel: 'qwen2.5-7b',
    skills: ['web-search', 'url-fetch'],
    temperature: 0.9,
    maxTokens: 4096,
  },
  {
    id: 'researcher',
    name: '深度研究',
    description: '多步自主研究，综合分析信息',
    icon: '🔬',
    systemPrompt: '你是一个深度研究助手。对于复杂问题，你会拆解为多个子问题，逐步搜集和分析信息，最后给出综合结论。回答结构清晰，引用来源。',
    defaultModel: 'deepseek-r1-distill',
    skills: ['web-search', 'url-fetch', 'weather', 'time-date'],
    temperature: 0.5,
    maxTokens: 8192,
  },
  {
    id: 'shell',
    name: '命令执行',
    description: '专注于 Shell 命令生成和系统操作',
    icon: '🖥️',
    systemPrompt: '你是一个 Shell 命令专家。根据用户需求生成精确的终端命令，包含必要的注释和安全提示。默认针对 macOS/Linux 环境。',
    defaultModel: 'qwen2.5-7b',
    skills: ['calculator'],
    temperature: 0.2,
    maxTokens: 2048,
  },
];

export function getAgentById(id: string): AgentConfig | undefined {
  return BUILTIN_AGENTS.find(a => a.id === id);
}
