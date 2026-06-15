/**
 * 寒影博客引擎 — 核心构建引擎
 * 自研 Markdown → HTML 渲染、模板引擎、RSS/站点地图生成、搜索索引
 */

import { parseMarkdown } from './parser.js';
import fs from 'fs';
import path from 'path';

// ========== 模板引擎 (EJS 风格，纯 JS 实现) ==========
export function renderTemplate(template, data) {
  return template.replace(/<%=([\s\S]*?)%>/g, (_, expr) => {
    try {
      const fn = new Function(...Object.keys(data), `return ${expr.trim()};`);
      const val = fn(...Object.values(data));
      return val !== undefined && val !== null ? String(val) : '';
    } catch {
      return `[Template Error: ${expr.trim()}]`;
    }
  }).replace(/<%([\s\S]*?)%>/g, (_, code) => {
    try {
      const fn = new Function(...Object.keys(data), code.trim());
      fn(...Object.values(data));
    } catch { /* silent */ }
    return '';
  });
}

// ========== 日期格式化 ==========
export function formatDate(date, locale = 'zh-CN') {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ========== 文章排序 ==========
export function sortPosts(posts, order = 'date-desc') {
  const sorted = [...posts];
  switch (order) {
    case 'date-desc': sorted.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)); break;
    case 'date-asc':  sorted.sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0)); break;
    case 'title':     sorted.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break;
    default:          sorted.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }
  return sorted;
}

// ========== 分页 ==========
export function paginate(posts, page = 1, perPage = 10) {
  const total = posts.length;
  const totalPages = Math.ceil(total / perPage);
  const p = Math.max(1, Math.min(page, totalPages));
  const start = (p - 1) * perPage;
  const items = posts.slice(start, start + perPage);
  return { items, page: p, totalPages, total, hasPrev: p > 1, hasNext: p < totalPages };
}

// ========== 标签/分类聚合 ==========
export function aggregateTaxonomies(posts) {
  const tags = {};
  const categories = {};
  for (const post of posts) {
    const postTags = Array.isArray(post.tags) ? post.tags : (post.tags ? [post.tags] : []);
    for (const t of postTags) {
      if (!tags[t]) tags[t] = { count: 0, posts: [] };
      tags[t].count++;
      tags[t].posts.push(post);
    }
    const cat = post.category || '未分类';
    if (!categories[cat]) categories[cat] = { count: 0, posts: [] };
    categories[cat].count++;
    categories[cat].posts.push(post);
  }
  return { tags, categories };
}

// ========== RSS 生成 ==========
export function generateRSS(config, posts, baseURL) {
  const items = posts.slice(0, 20).map(p => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${baseURL}/posts/${p.slug}/</link>
      <guid>${baseURL}/posts/${p.slug}/</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt || ''}]]></description>
      ${p.tags ? p.tags.map(t => `<category>${t}</category>`).join('\n') : ''}
    </item>`).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${config.title}</title>
    <link>${baseURL}</link>
    <description>${config.subtitle || ''}</description>
    <language>${config.language || 'zh-CN'}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseURL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
  return rss;
}

// ========== Atom Feed 生成 ==========
export function generateAtom(config, posts, baseURL) {
  const entries = posts.slice(0, 20).map(p => `
    <entry>
      <title>${p.title}</title>
      <link href="${baseURL}/posts/${p.slug}/"/>
      <id>${baseURL}/posts/${p.slug}/</id>
      <published>${new Date(p.date).toISOString()}</published>
      <updated>${new Date(p.updated || p.date).toISOString()}</updated>
      ${p.tags ? p.tags.map(t => `<category term="${t}"/>`).join('\n') : ''}
      <summary>${p.excerpt || ''}</summary>
    </entry>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${config.title}</title>
  <link href="${baseURL}/atom.xml" rel="self"/>
  <link href="${baseURL}"/>
  <id>${baseURL}</id>
  <updated>${new Date().toISOString()}</updated>
  ${entries}
</feed>`;
}

// ========== 站点地图生成 ==========
export function generateSitemap(pages, baseURL) {
  const urls = pages.map(p => `
  <url>
    <loc>${baseURL}${p.url}</loc>
    <lastmod>${p.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${p.changefreq || 'weekly'}</changefreq>
    <priority>${p.priority || '0.5'}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

// ========== 搜索索引生成 (简易 lunr 风格) ==========
export function generateSearchIndex(posts) {
  const index = posts.map((p, i) => ({
    id: i,
    title: p.title,
    slug: p.slug,
    date: p.date,
    excerpt: p.excerpt || '',
    tags: p.tags || [],
    category: p.category || '',
    keywords: tokenize(`${p.title} ${p.excerpt || ''} ${(p.tags || []).join(' ')}`)
  }));

  function tokenize(text) {
    return (text || '').toLowerCase()
      .replace(/[^\w\u4e00-\u9fff\s]/g, ' ')
      .split(/\s+/)
      .filter(w => w.length > 1);
  }

  return { index, tokenize };
}

// ========== 搜索函数 ==========
export function search(query, searchIndex) {
  const terms = searchIndex.tokenize(query);
  if (terms.length === 0) return [];
  const results = searchIndex.index.map(item => {
    let score = 0;
    const titleLower = item.title.toLowerCase();
    for (const term of terms) {
      if (titleLower.includes(term)) score += 10;
      for (const kw of item.keywords) {
        if (kw.includes(term)) score += 1;
      }
    }
    return { ...item, score };
  }).filter(r => r.score > 0).sort((a, b) => b.score - a.score);
  return results;
}
