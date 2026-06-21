// ============================================================
// Agent Hub - Skill Registry Hook
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import type { SkillDefinition } from '../types';
import { BUILTIN_SKILLS } from '../lib/skills';
import { getCustomSkills, saveCustomSkill, deleteCustomSkill } from '../lib/db';

export function useSkillRegistry() {
  const [skills, setSkills] = useState<SkillDefinition[]>(BUILTIN_SKILLS);
  const [activeSkills, setActiveSkills] = useState<string[]>(
    BUILTIN_SKILLS.map(s => s.id)
  );

  useEffect(() => {
    getCustomSkills().then(custom => {
      setSkills(prev => [...prev, ...custom]);
    });
  }, []);

  const installSkill = useCallback(async (skill: SkillDefinition) => {
    await saveCustomSkill(skill);
    setSkills(prev => [...prev.filter(s => s.id !== skill.id), skill]);
  }, []);

  const removeSkill = useCallback(async (skillId: string) => {
    await deleteCustomSkill(skillId);
    setSkills(prev => prev.filter(s => s.id !== skillId));
    setActiveSkills(prev => prev.filter(id => id !== skillId));
  }, []);

  const toggleSkill = useCallback((skillId: string) => {
    setActiveSkills(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  }, []);

  const enableAllSkills = useCallback(() => {
    setActiveSkills(skills.map(s => s.id));
  }, [skills]);

  const disableAllSkills = useCallback(() => {
    setActiveSkills([]);
  }, []);

  return {
    skills,
    activeSkills,
    installSkill,
    removeSkill,
    toggleSkill,
    enableAllSkills,
    disableAllSkills,
  };
}
