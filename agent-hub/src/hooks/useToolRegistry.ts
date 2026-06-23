// ============================================================
// Agent Hub — Tool Registry Hook
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import type { InstalledTool, ToolDefinition } from '../types';
import { TOOL_CATALOG } from '../lib/tools';
import { getInstalledTools, saveInstalledTool, removeInstalledTool } from '../lib/db';

export function useToolRegistry() {
  const [installed, setInstalled] = useState<InstalledTool[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getInstalledTools().then(tools => {
      setInstalled(tools);
      setLoaded(true);
    });
  }, []);

  const install = useCallback(async (toolId: string, customUrl?: string) => {
    const record: InstalledTool = {
      toolId,
      customUrl,
      installedAt: Date.now(),
      isPinned: false,
    };
    await saveInstalledTool(record);
    setInstalled(prev => [...prev.filter(t => t.toolId !== toolId), record]);
  }, []);

  const uninstall = useCallback(async (toolId: string) => {
    await removeInstalledTool(toolId);
    setInstalled(prev => prev.filter(t => t.toolId !== toolId));
  }, []);

  const togglePin = useCallback(async (toolId: string) => {
    const existing = installed.find(t => t.toolId === toolId);
    if (!existing) return;
    const updated: InstalledTool = { ...existing, isPinned: !existing.isPinned };
    await saveInstalledTool(updated);
    setInstalled(prev => prev.map(t => t.toolId === toolId ? updated : t));
  }, [installed]);

  const getTool = useCallback((toolId: string): ToolDefinition | undefined => {
    return TOOL_CATALOG.find(t => t.id === toolId);
  }, []);

  const getUrl = useCallback((toolId: string): string => {
    const record = installed.find(t => t.toolId === toolId);
    const def = TOOL_CATALOG.find(t => t.id === toolId);
    return record?.customUrl || def?.cloudUrl || def?.defaultUrl || '';
  }, [installed]);

  const isInstalled = useCallback((toolId: string): boolean => {
    return installed.some(t => t.toolId === toolId);
  }, [installed]);

  return {
    installed,
    loaded,
    install,
    uninstall,
    togglePin,
    getTool,
    getUrl,
    isInstalled,
  };
}
