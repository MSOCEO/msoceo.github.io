/**
 * Date & Time Skill
 */

interface SkillInput {
  action?: 'now' | 'format' | 'diff';
  format?: string;
  date1?: string;
  date2?: string;
}

export async function execute(input: SkillInput) {
  const now = new Date();
  const action = input.action || 'now';

  if (action === 'now') {
    return {
      iso: now.toISOString(),
      local: now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
      utc: now.toUTCString(),
      timestamp: now.getTime(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      weekday: now.toLocaleString('en-US', { weekday: 'long' }),
    };
  }

  if (action === 'diff' && input.date1 && input.date2) {
    const d1 = new Date(input.date1);
    const d2 = new Date(input.date2);
    const diffMs = Math.abs(d2.getTime() - d1.getTime());
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, totalHours: Math.floor(diffMs / (1000 * 60 * 60)) };
  }

  return { now: now.toISOString() };
}

export const skillMeta = {
  id: 'date-time',
  name: 'Date & Time',
  description: 'Get current date, time, and perform date calculations.',
  category: 'Utility',
  parameters: {
    action: { type: 'string', description: 'Operation: now, diff', required: false },
    date1: { type: 'string', description: 'First date (ISO format)', required: false },
    date2: { type: 'string', description: 'Second date (ISO format)', required: false },
  },
};
