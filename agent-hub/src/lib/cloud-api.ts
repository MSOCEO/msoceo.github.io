// ============================================================
// Agent Hub — Cloud API Service
// OpenAI-compatible endpoint caller with streaming.
// API keys stored in IndexedDB (settings store).
// ============================================================

import { setSetting, getSetting } from './db';
import type { CloudModel } from './cloud-models';

// ─── Types ───

export interface CloudProviderConfig {
  providerId: string;
  apiKey: string;
  endpoint: string;        // base URL, e.g. https://api.openai.com/v1
  customModelId?: string;  // for custom providers
}

export interface CloudChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
}

export interface CloudStreamCallbacks {
  onContent: (text: string, full: string) => void;
  onReasoning?: (text: string, full: string) => void;
  onDone: (fullContent: string, usage?: { promptTokens: number; completionTokens: number }) => void;
  onError: (error: string) => void;
}

// ─── Key Management (IndexedDB) ───

const KEY_PREFIX = 'apiKey_';
const ENDPOINT_PREFIX = 'endpoint_';

export async function saveApiKey(providerId: string, apiKey: string): Promise<void> {
  await setSetting(KEY_PREFIX + providerId, apiKey);
}

export async function getApiKey(providerId: string): Promise<string | undefined> {
  return getSetting<string>(KEY_PREFIX + providerId);
}

export async function saveEndpoint(providerId: string, endpoint: string): Promise<void> {
  await setSetting(ENDPOINT_PREFIX + providerId, endpoint);
}

export async function getEndpoint(providerId: string): Promise<string | undefined> {
  return getSetting<string>(ENDPOINT_PREFIX + providerId);
}

export async function clearApiKey(providerId: string): Promise<void> {
  await setSetting(KEY_PREFIX + providerId, undefined);
}

export async function hasApiKey(providerId: string): Promise<boolean> {
  const key = await getApiKey(providerId);
  return !!key && key.length > 0;
}

// ─── Stream Parser ───
// OpenAI-compatible endpoints return SSE: "data: {...}\n\n"
// DeepSeek R1 returns reasoning_content in delta.

async function* parseSSEStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split('\n');
    buffer = lines.pop() || '';  // last incomplete line stays in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          yield JSON.parse(jsonStr);
        } catch {
          // skip malformed chunks
        }
      }
    }
  }
}

// ─── Main API Call ───

export async function streamChat(
  model: CloudModel,
  messages: CloudChatMessage[],
  callbacks: CloudStreamCallbacks,
  options?: {
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;    // override stored key
    endpoint?: string;  // override stored endpoint
  },
): Promise<void> {
  const apiKey = options?.apiKey || await getApiKey(model.providerId);
  const endpoint = options?.endpoint || await getEndpoint(model.providerId) || model.suggestedEndpoint || '';

  if (!apiKey) {
    callbacks.onError('未配置 API Key，请在设置中配置。');
    return;
  }
  if (!endpoint) {
    callbacks.onError('未配置 API 端点，请在设置中配置。');
    return;
  }

  const url = endpoint.replace(/\/+$/, '') + '/chat/completions';

  const body: Record<string, unknown> = {
    model: model.modelId,
    messages,
    stream: true,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });
  } catch (err: unknown) {
    callbacks.onError(`网络错误: ${err instanceof Error ? err.message : String(err)}`);
    return;
  }

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errBody = await response.json();
      errorMsg = errBody.error?.message || errBody.message || errorMsg;
    } catch {
      try { errorMsg = await response.text() || errorMsg; } catch {}
    }
    callbacks.onError(errorMsg);
    return;
  }

  if (!response.body) {
    callbacks.onError('响应无正文，不支持流式读取。');
    return;
  }

  // ─── Stream Reading ───
  const reader = response.body.getReader();
  let fullContent = '';
  let fullReasoning = '';

  try {
    for await (const chunk of parseSSEStream(reader)) {
      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;

      // DeepSeek R1: reasoning_content
      if (delta.reasoning_content) {
        fullReasoning += delta.reasoning_content;
        callbacks.onReasoning?.(delta.reasoning_content, fullReasoning);
      }

      if (delta.content) {
        fullContent += delta.content;
        callbacks.onContent(delta.content, fullContent);
      }
    }

    // Extract usage if available
    const usage = undefined; // usage typically in last chunk's `usage` field
    callbacks.onDone(fullContent, usage);
  } catch (err: unknown) {
    if ((err as any)?.name === 'AbortError') return;
    callbacks.onError(`流读取错误: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ─── Non-streaming (for tool-calling support) ───

export async function chatCompletion(
  model: CloudModel,
  messages: CloudChatMessage[],
  options?: {
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
    endpoint?: string;
    tools?: Array<Record<string, unknown>>;
  },
): Promise<{ content: string; toolCalls?: Array<{ id: string; name: string; arguments: Record<string, unknown> }> }> {
  const apiKey = options?.apiKey || await getApiKey(model.providerId);
  const endpoint = options?.endpoint || await getEndpoint(model.providerId) || model.suggestedEndpoint || '';

  if (!apiKey) throw new Error('未配置 API Key');
  if (!endpoint) throw new Error('未配置 API 端点');

  const url = endpoint.replace(/\/+$/, '') + '/chat/completions';

  const body: Record<string, unknown> = {
    model: model.modelId,
    messages,
    stream: false,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 2048,
  };
  if (options?.tools && options.tools.length > 0) {
    body.tools = options.tools;
    body.tool_choice = 'auto';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error?.message || `HTTP ${response.status}`);
  }

  const data = await response.json();
  const msg = data.choices?.[0]?.message;

  const toolCalls = (msg?.tool_calls || []).map((tc: any) => ({
    id: tc.id,
    name: tc.function?.name || '',
    arguments: JSON.parse(tc.function?.arguments || '{}'),
  }));

  return {
    content: msg?.content || '',
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
  };
}

// ─── Test Connection ───

export async function testConnection(
  providerId: string,
  apiKey: string,
  endpoint: string,
): Promise<{ ok: boolean; message: string }> {
  const url = endpoint.replace(/\/+$/, '') + '/models';
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (response.ok) return { ok: true, message: '连接成功！' };
    const err = await response.json().catch(() => ({}));
    return { ok: false, message: err.error?.message || `HTTP ${response.status}` };
  } catch (err: unknown) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) };
  }
}
