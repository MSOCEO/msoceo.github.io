// ============================================================
// Agent Hub - Built-in Skills Registry
// ============================================================

import type { SkillDefinition } from '../types';

export const BUILTIN_SKILLS: SkillDefinition[] = [
  {
    id: 'web-search',
    name: '网页搜索',
    description: '搜索互联网获取实时信息（DuckDuckGo）',
    icon: '🔍',
    category: 'search',
    parameters: [
      { name: 'query', type: 'string', description: '搜索关键词', required: true },
      { name: 'maxResults', type: 'number', description: '最大结果数', required: false, default: 5 },
    ],
    execute: `async ({ query, maxResults = 5 }) => {
      const res = await fetch('https://api.duckduckgo.com/?q=' + encodeURIComponent(query) + '&format=json&no_html=1');
      const data = await res.json();
      const results = (data.RelatedTopics || []).slice(0, maxResults).map((t, i) => ({
        title: t.Text?.split(' - ')[0] || t.Text,
        url: t.FirstURL,
        snippet: t.Text,
      }));
      return JSON.stringify(results);
    }`,
    isBuiltin: true,
  },
  {
    id: 'time-date',
    name: '日期时间',
    description: '获取当前日期和时间信息',
    icon: '📅',
    category: 'productivity',
    parameters: [
      { name: 'timezone', type: 'string', description: '时区，如 Asia/Shanghai', required: false, default: 'Asia/Shanghai' },
    ],
    execute: `async ({ timezone = 'Asia/Shanghai' }) => {
      const now = new Date();
      const opts = { timeZone: timezone, year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      return JSON.stringify({ datetime: now.toLocaleString('zh-CN', opts), timestamp: now.getTime(), timezone });
    }`,
    isBuiltin: true,
  },
  {
    id: 'calculator',
    name: '计算器',
    description: '执行数学计算',
    icon: '🧮',
    category: 'productivity',
    parameters: [
      { name: 'expression', type: 'string', description: '数学表达式', required: true },
    ],
    execute: `async ({ expression }) => {
      const sanitized = expression.replace(/[^0-9+\\-*/().%\\s]/g, '');
      const result = Function('"use strict"; return (' + sanitized + ')')();
      return JSON.stringify({ expression, result });
    }`,
    isBuiltin: true,
  },
  {
    id: 'weather',
    name: '天气查询',
    description: '查询城市天气（开放 API，无需 Key）',
    icon: '🌤️',
    category: 'search',
    parameters: [
      { name: 'city', type: 'string', description: '城市名称（中文）', required: true },
    ],
    execute: `async ({ city }) => {
      try {
        const geo = await fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city) + '&count=1&language=zh');
        const geoData = await geo.json();
        if (!geoData.results?.length) return JSON.stringify({ error: '未找到城市' });
        const { latitude, longitude, name, country } = geoData.results[0];
        const weather = await fetch('https://api.open-meteo.com/v1/forecast?latitude=' + latitude + '&longitude=' + longitude + '&current_weather=true');
        const wData = await weather.json();
        return JSON.stringify({ city: name, country, temperature: wData.current_weather.temperature + '°C', windspeed: wData.current_weather.windspeed + 'km/h', weathercode: wData.current_weather.weathercode });
      } catch (e) { return JSON.stringify({ error: e.message }); }
    }`,
    isBuiltin: true,
  },
  {
    id: 'url-fetch',
    name: '网页抓取',
    description: '抓取并提取网页正文内容',
    icon: '🌐',
    category: 'search',
    parameters: [
      { name: 'url', type: 'string', description: '目标网页 URL', required: true },
    ],
    execute: `async ({ url }) => {
      try {
        const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(url));
        const html = await res.text();
        const text = html.replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '').replace(/<style[^>]*>[\\s\\S]*?<\\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim().substring(0, 3000);
        return JSON.stringify({ url, text: text || '(无法提取正文)' });
      } catch (e) { return JSON.stringify({ error: e.message }); }
    }`,
    isBuiltin: true,
  },
  {
    id: 'code-runner',
    name: '代码执行',
    description: '在沙箱中执行 JavaScript 代码',
    icon: '⚡',
    category: 'code',
    parameters: [
      { name: 'code', type: 'string', description: 'JavaScript 代码', required: true },
    ],
    execute: `async ({ code }) => {
      try {
        const result = eval(code);
        return JSON.stringify({ result: String(result) });
      } catch (e) { return JSON.stringify({ error: e.message }); }
    }`,
    isBuiltin: true,
  },
];

export function getSkillById(id: string): SkillDefinition | undefined {
  return BUILTIN_SKILLS.find(s => s.id === id);
}
