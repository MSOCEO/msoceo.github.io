// ============================================================
// Agent Hub - Cloud Model Hook
// Same interface as useWebLLM, but calls cloud APIs.
// ============================================================

import { useCallback, useState } from 'react';
import type { CloudModel } from '../lib/cloud-models';
import type { ChatMessage } from '../types';
import { streamChat, chatCompletion } from '../lib/cloud-api';
import { getSkillById } from '../lib/skills';
import { getApiKey } from '../lib/cloud-api';

export type CloudLoadState =
  | { status: 'idle' }
  | { status: 'ready' }
  | { status: 'error'; error: string };

interface UseCloudModelReturn {
  loadModel: (model: CloudModel) => Promise<void>;
  unloadModel: () => void;
  sendMessage: (content: string, history: ChatMessage[], skills: string[], systemPrompt?: string) => Promise<ChatMessage>;
  loadState: CloudLoadState;
  currentModel: CloudModel | null;
  isGenerating: boolean;
  streamingContent: string;
  reasoningContent: string;
}

export function useCloudModel(): UseCloudModelReturn {
  const [loadState, setLoadState] = useState<CloudLoadState>({ status: 'idle' });
  const [currentModel, setCurrentModel] = useState<CloudModel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [reasoningContent, setReasoningContent] = useState('');

  const loadModel = useCallback(async (model: CloudModel) => {
    setCurrentModel(model);
    setStreamingContent('');
    setReasoningContent('');

    const key = await getApiKey(model.providerId);
    if (!key) {
      setLoadState({ status: 'error', error: `未配置 ${model.provider} 的 API Key，请在设置中配置。` });
      return;
    }
    setLoadState({ status: 'ready' });
  }, []);

  const buildToolDefinitions = useCallback((skillIds: string[]) => {
    return skillIds
      .map(id => getSkillById(id))
      .filter((s): s is NonNullable<typeof s> => !!s)
      .map(skill => ({
        type: 'function' as const,
        function: {
          name: skill.id,
          description: skill.description,
          parameters: {
            type: 'object' as const,
            properties: Object.fromEntries(
              skill.parameters.map(p => [
                p.name,
                { type: p.type, description: p.description },
              ])
            ),
            required: skill.parameters.filter(p => p.required).map(p => p.name),
          },
        },
      }));
  }, []);

  const sendMessage = useCallback(async (
    content: string,
    history: ChatMessage[],
    skills: string[],
    systemPrompt?: string,
  ): Promise<ChatMessage> => {
    if (!currentModel) throw new Error('未选择模型');

    setIsGenerating(true);
    setStreamingContent('');
    setReasoningContent('');

    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    for (const msg of history) {
      if (msg.role !== 'system') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
    messages.push({ role: 'user', content });

    const tools = buildToolDefinitions(skills);
    let fullContent = '';
    let fullReasoning = '';

    try {
      if (tools.length > 0) {
        // Step 1: non-streaming call to check for tool calls
        const result = await chatCompletion(
          currentModel,
          messages as any,
          { tools: tools as any[] },
        );

        if (result.toolCalls && result.toolCalls.length > 0) {
          // Execute tool calls
          const toolResults: Array<{ role: 'tool'; tool_call_id: string; content: string }> = [];
          for (const tc of result.toolCalls) {
            const skill = getSkillById(tc.name);
            let resultStr = '';
            if (skill) {
              try {
                const fn = new Function('params', `return (${skill.execute})(params);`);
                resultStr = await fn(tc.arguments);
              } catch (err: unknown) {
                resultStr = JSON.stringify({
                  error: err instanceof Error ? err.message : String(err),
                });
              }
            }
            toolResults.push({
              role: 'tool',
              tool_call_id: tc.id,
              content: resultStr,
            });
          }

          // Stream final response after tool calls
          await new Promise<void>((resolve, reject) => {
            streamChat(
              currentModel,
              [...messages, ...toolResults] as any,
              {
                onContent: (text: string, full: string) => {
                  fullContent = full;
                  setStreamingContent(full);
                },
                onReasoning: (text: string, full: string) => {
                  fullReasoning = full;
                  setReasoningContent(full);
                },
                onDone: () => resolve(),
                onError: (err: string) => reject(new Error(err)),
              },
            ).catch(reject);
          });
        } else if (result.content) {
          // No tool calls, stream directly
          await new Promise<void>((resolve, reject) => {
            streamChat(
              currentModel,
              messages as any,
              {
                onContent: (text: string, full: string) => {
                  fullContent = full;
                  setStreamingContent(full);
                },
                onReasoning: (text: string, full: string) => {
                  fullReasoning = full;
                  setReasoningContent(full);
                },
                onDone: () => resolve(),
                onError: (err: string) => reject(new Error(err)),
              },
            ).catch(reject);
          });
        }
      } else {
        // No skills, stream directly
        await new Promise<void>((resolve, reject) => {
          streamChat(
            currentModel,
            messages as any,
            {
              onContent: (text: string, full: string) => {
                fullContent = full;
                setStreamingContent(full);
              },
              onReasoning: (text: string, full: string) => {
                fullReasoning = full;
                setReasoningContent(full);
              },
              onDone: () => resolve(),
              onError: (err: string) => reject(new Error(err)),
            },
          ).catch(reject);
        });
      }
    } catch (err: unknown) {
      setIsGenerating(false);
      setStreamingContent('');
      throw err;
    }

    setIsGenerating(false);
    setStreamingContent('');

    return {
      id: crypto.randomUUID(),
      role: 'assistant' as const,
      content: fullContent || '(无输出)',
      timestamp: Date.now(),
      reasoningContent: fullReasoning || undefined,
    };
  }, [currentModel, buildToolDefinitions]);

  const unloadModel = useCallback(() => {
    setCurrentModel(null);
    setLoadState({ status: 'idle' });
    setStreamingContent('');
    setReasoningContent('');
  }, []);

  return {
    loadModel,
    unloadModel,
    sendMessage,
    loadState,
    currentModel,
    isGenerating,
    streamingContent,
    reasoningContent,
  };
}
