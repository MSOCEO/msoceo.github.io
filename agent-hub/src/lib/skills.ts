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
    execute: `async ({ query, maxResults = 8 }) => {
  const limit = Math.min(maxResults || 8, 15);
  // SearXNG public instances — no API key, no CORS issues
  const searxInstances = [
    'https://search.sapti.me',
    'https://searx.be',
    'https://search.inetol.net',
    'https://search.rhscz.eu',
  ];
  for (const base of searxInstances) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 4000);
      const resp = await fetch(base + '/search?q=' + encodeURIComponent(query) + '&format=json&categories=general&language=zh', { signal: ctrl.signal });
      clearTimeout(t);
      if (!resp.ok) continue;
      const data = await resp.json();
      const results = (data.results || []).slice(0, limit).map(r => ({
        title: r.title || '', url: r.url || '', snippet: (r.content || r.snippet || '').replace(/\\\\n/g, ' '),
      }));
      if (results.length > 0) return JSON.stringify(results);
    } catch {}
  }
  // Fallback: DuckDuckGo Lite HTML search
  try {
    const fd = new URLSearchParams(); fd.append('q', query);
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), 5000);
    const resp2 = await fetch('https://lite.duckduckgo.com/lite/', { method: 'POST', body: fd, signal: ctrl2.signal });
    clearTimeout(t2);
    const html = await resp2.text();
    const results = [];
    const re = /<a[^>]*rel="nofollow"[^>]*>([^<]+)<\\/a>.*?<td class="result-snippet">([^<]*?)</gs;
    let m;
    while ((m = re.exec(html)) && results.length < limit) {
      results.push({ title: m[1].trim(), url: '', snippet: m[2].trim() });
    }
    if (results.length > 0) return JSON.stringify(results);
  } catch {}
  return JSON.stringify([]);
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
