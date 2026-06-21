import { useCallback, useRef, useState } from 'react';
import { CreateMLCEngine, type MLCEngine } from '@mlc-ai/web-llm';
import type { ModelEntry, ModelLoadState, ChatMessage, ToolCall, SkillDefinition } from '../types';
import { BUILTIN_SKILLS, getSkillById } from '../lib/skills';

export function useWebLLM() {
  const engineRef = useRef<MLCEngine | null>(null);
  const [loadState, setLoadState] = useState<ModelLoadState>({ status: 'idle' });
  const [currentModel, setCurrentModel] = useState<ModelEntry | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [reasoningContent, setReasoningContent] = useState('');

  const loadModel = useCallback(async (model: ModelEntry) => {
    if (engineRef.current) { await engineRef.current.unload(); engineRef.current = null; }
    setLoadState({ status: 'loading' });
    setCurrentModel(model);
    setStreamingContent(''); setReasoningContent('');
    try {
      const engine = await CreateMLCEngine(model.modelId, {
        initProgressCallback: (p) => setLoadState({ status: 'downloading', progress: p.progress, loaded: p.loaded, total: p.total }),
        logLevel: 'WARN',
      });
      engineRef.current = engine;
      setLoadState({ status: 'ready' });
    } catch (err: unknown) {
      setLoadState({ status: 'error', error: err instanceof Error ? err.message : String(err) });
    }
  }, []);

  const buildToolDefinitions = useCallback((skillIds: string[]) => {
    return skillIds.map(id => getSkillById(id) || BUILTIN_SKILLS.find(s => s.id === id))
      .filter((s): s is SkillDefinition => !!s)
      .map(skill => ({
        type: 'function' as const,
        function: { name: skill.id, description: skill.description, parameters: { type: 'object' as const, properties: Object.fromEntries(skill.parameters.map(p => [p.name, { type: p.type, description: p.description }])), required: skill.parameters.filter(p => p.required).map(p => p.name) } },
      }));
  }, []);

  const sendMessage = useCallback(async (content: string, history: ChatMessage[], skills: string[], systemPrompt?: string): Promise<ChatMessage> => {
    const engine = engineRef.current;
    if (!engine) throw new Error('Model not loaded');
    setIsGenerating(true); setStreamingContent(''); setReasoningContent('');

    const messages: Array<{ role: string; content: string }> = [];
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
    for (const msg of history) { if (msg.role !== 'system') messages.push({ role: msg.role, content: msg.content }); }
    messages.push({ role: 'user', content });

    const tools = buildToolDefinitions(skills);

    const doChat = async (msgs: Array<{ role: string; content: string }>) => {
      let fc = '', fr = '';
      const tcs: ToolCall[] = [];
      const chunks = await engine.chat.completions.create({
        messages: msgs as any, tools: tools.length > 0 ? tools as any : undefined,
        tool_choice: tools.length > 0 ? 'auto' : undefined,
        temperature: 0.7, max_tokens: 2048, stream: true, stream_options: { include_usage: true },
      } as any);
      for await (const chunk of chunks) {
        const delta = (chunk as any).choices?.[0]?.delta;
        if (!delta) continue;
        if (delta.reasoning_content) { fr += delta.reasoning_content; setReasoningContent(fr); }
        if (delta.content) { fc += delta.content; setStreamingContent(fc); }
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const ex = tcs.find(t => t.id === tc.id);
            if (ex) { if (tc.function?.arguments) { try { ex.arguments = JSON.parse(tc.function.arguments); } catch {} } }
            else if (tc.id && tc.function) { tcs.push({ id: tc.id, name: tc.function.name || '', arguments: {} }); }
          }
        }
      }
      return { fc, fr, tcs };
    };

    let { fc: fullContent, fr: fullReasoning, tcs: toolCalls } = await doChat(messages);

    if (toolCalls.length > 0) {
      for (const tc of toolCalls) {
        const skill = getSkillById(tc.name);
        if (skill) { try { const fn = new Function('params', `return (${skill.execute})(params);`); tc.result = await fn(tc.arguments); } catch (err: unknown) { tc.result = JSON.stringify({ error: err instanceof Error ? err.message : String(err) }); } }
      }
      const tm = toolCalls.map(tc => ({ role: 'tool' as const, tool_call_id: tc.id, content: tc.result || '' }));
      const r2 = await doChat([...messages, ...tm]);
      fullContent = r2.fc; fullReasoning = r2.fr;
    }

    setIsGenerating(false); setStreamingContent('');
    return { id: crypto.randomUUID(), role: 'assistant', content: fullContent || '(无输出)', timestamp: Date.now(), toolCalls: toolCalls.length > 0 ? toolCalls : undefined, reasoningContent: fullReasoning || undefined };
  }, [buildToolDefinitions]);

  const unloadModel = useCallback(async () => {
    if (engineRef.current) { await engineRef.current.unload(); engineRef.current = null; }
    setLoadState({ status: 'idle' }); setCurrentModel(null);
  }, []);

  return { loadModel, unloadModel, sendMessage, loadState, currentModel, isGenerating, streamingContent, reasoningContent };
}
