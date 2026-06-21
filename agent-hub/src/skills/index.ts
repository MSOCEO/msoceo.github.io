/**
 * Skills Index — Agnostically imports all skill modules.
 * Each skill module exports: { execute, skillMeta }
 */

import * as webSearch from './web-search';
import * as webFetch from './web-fetch';
import * as dateTime from './date-time';
import * as calculator from './calculator';
import * as weather from './weather';

export const skillRegistry: Record<string, {
  execute: (input: any) => Promise<any>;
  meta: Record<string, any>;
}> = {
  'web-search': { execute: webSearch.execute, meta: webSearch.skillMeta },
  'web-fetch': { execute: webFetch.execute, meta: webFetch.skillMeta },
  'date-time': { execute: dateTime.execute, meta: dateTime.skillMeta },
  'calculator': { execute: calculator.execute, meta: calculator.skillMeta },
  'weather': { execute: weather.execute, meta: weather.skillMeta },
};

export function getSkillMeta(id: string) {
  return skillRegistry[id]?.meta || null;
}

export async function executeSkill(id: string, input: any) {
  const skill = skillRegistry[id];
  if (!skill) throw new Error(`Skill "${id}" not found in registry`);
  return skill.execute(input);
}

export function getAllSkillMeta() {
  return Object.values(skillRegistry).map(s => s.meta);
}
