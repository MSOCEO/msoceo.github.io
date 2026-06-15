/**
 * 寒影博客引擎 — Markdown 解析器
 * 支持: YAML Front Matter, GFM, 代码高亮, KaTeX, Mermaid, 短代码
 */

import fs from 'fs';

// ========== YAML Front Matter 解析 ==========
function parseFrontMatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  const meta = {};
  const lines = match[1].split('\n');
  let currentKey = '';
  for (const line of lines) {
    const kv = line.match(/^(\w[\w-]*):\s*(.*)/);
    if (kv) {
      currentKey = kv[1];
      let val = kv[2].trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      if (/^\d+$/.test(val)) val = parseInt(val);
      if (val === 'true') val = true;
      if (val === 'false') val = false;

      // Array support
      if (/^\[.*\]$/.test(val)) {
        try { val = JSON.parse(val); } catch { val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')); }
      }
      meta[currentKey] = val;
    } else if (line.trim().startsWith('- ') && currentKey) {
      const item = line.trim().slice(2).trim().replace(/^["']|["']$/g, '');
      if (!Array.isArray(meta[currentKey])) meta[currentKey] = [];
      meta[currentKey].push(item);
    }
  }
  return { meta, body: match[2] };
}

// ========== Markdown → HTML 渲染（自研轻量解析器） ==========
function renderMarkdown(md) {
  let html = md;

  // ---- 短代码 ----
  // {% note type %}...{% /note %}
  html = html.replace(/\{%\s*note\s+(\w+)\s*%\}([\s\S]*?)\{%\s*\/note\s*%\}/g, (_, type, content) => {
    return `<div class="shortcode-note shortcode-note--${type}">${renderMarkdown(content.trim())}</div>`;
  });
  // {% youtube ID %}
  html = html.replace(/\{%\s*youtube\s+([\w-]+)\s*%\}/g, (_, id) => {
    return `<div class="shortcode-youtube"><iframe src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe></div>`;
  });
  // {% codepen user/slug %}
  html = html.replace(/\{%\s*codepen\s+([\w-/]+)\s*%\}/g, (_, slug) => {
    return `<div class="shortcode-codepen"><iframe scrolling="no" src="https://codepen.io/${slug}/embed/preview/"></iframe></div>`;
  });

  // ---- 代码块 (GFM fenced code with language) ----
  const codeBlocks = [];
  html = html.replace(/```(\w*)\s*\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    codeBlocks.push({ lang, code: escaped });
    return `%%CODEBLOCK_${idx}%%`;
  });

  // ---- 行内代码 ----
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // ---- Mermaid 图表 ----
  html = html.replace(/```mermaid\s*\n([\s\S]*?)```/g, (_, content) => {
    return `<div class="mermaid">${content.trim()}</div>`;
  });

  // ---- KaTeX 数学公式 ----
  // 块级公式 $$
  html = html.replace(/\$\$\s*\n([\s\S]*?)\n\s*\$\$/g, (_, formula) => {
    return `<div class="katex-block">${formula.trim()}</div>`;
  });
  // 行内公式 $
  html = html.replace(/\$(.+?)\$/g, (_, formula) => {
    return `<span class="katex-inline">${formula.trim()}</span>`;
  });

  // ---- 标题 (h1-h6) ----
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // ---- 水平线 ----
  html = html.replace(/^ {0,3}([-*_]){3,}\s*$/gm, '<hr>');

  // ---- GFM 表格 ----
  html = parseGFMTables(html);

  // ---- 图片 ----
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');

  // ---- 链接 ----
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // ---- 任务列表 ----
  html = html.replace(/^[\t ]*- \[x\] (.+)$/gm, '<li class="task-list-item"><input type="checkbox" checked disabled> $1</li>');
  html = html.replace(/^[\t ]*- \[ \] (.+)$/gm, '<li class="task-list-item"><input type="checkbox" disabled> $1</li>');

  // ---- 无序列表 ----
  html = html.replace(/^[\t ]*[-*+] (.+)$/gm, '<li>$1</li>');
  // ---- 有序列表 ----
  html = html.replace(/^[\t ]*\d+\. (.+)$/gm, '<li>$1</li>');

  // ---- 粗体 / 斜体 / 删除线 ----
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  html = html.replace(/___(.+?)___/g, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // ---- 引用块 ----
  html = html.replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>');
  // 合并连续引用块
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

  // ---- 段落 ----
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs.map(p => {
    p = p.trim();
    if (!p) return '';
    // 跳过已经是块级元素的
    if (/^<(h[1-6]|ul|ol|li|blockquote|hr|table|pre|div|img|figure)/.test(p)) return p;
    // 替换行内换行为 <br>
    p = p.replace(/\n/g, '<br>');
    return `<p>${p}</p>`;
  }).join('\n');

  // ---- 还原代码块 ----
  html = html.replace(/%%CODEBLOCK_(\d+)%%/g, (_, idx) => {
    const { lang, code } = codeBlocks[idx] || {};
    const langAttr = lang ? ` class="language-${lang}"` : '';
    return `<pre><code${langAttr}>${code}</code></pre>`;
  });

  // ---- 列表包装 ----
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, (match) => {
    if (match.includes('task-list-item')) return `<ul class="task-list">${match}</ul>`;
    return `<ul>${match}</ul>`;
  });
  // 避免 ul 嵌套在 ul 内
  html = html.replace(/<\/ul>\s*<ul>/g, '\n');

  return html;
}

function parseGFMTables(html) {
  const lines = html.split('\n');
  const result = [];
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableRow = /^\|.+\|$/.test(line.trim());
    const isSepRow = /^\|[\s\-:|]+\|$/.test(line.trim());

    if (isTableRow && !isSepRow) {
      if (!inTable) { inTable = true; tableRows = []; }
      tableRows.push(line);
    } else if (isSepRow && inTable && tableRows.length === 1) {
      tableRows.push(line); // 分隔行，标记
    } else {
      if (inTable && tableRows.length >= 2) {
        result.push(renderTable(tableRows));
      }
      inTable = false;
      tableRows = [];
      result.push(line);
    }
  }
  if (inTable && tableRows.length >= 2) {
    result.push(renderTable(tableRows));
  }

  return result.join('\n');

  function renderTable(rows) {
    const header = rows[0];
    const alignRow = rows[1];
    const body = rows.slice(2);

    const parseRow = (r) => r.replace(/^\||\|$/g, '').split('|').map(c => c.trim());
    const aligns = parseRow(alignRow).map(c => {
      if (c.startsWith(':') && c.endsWith(':')) return 'center';
      if (c.endsWith(':')) return 'right';
      return 'left';
    });

    const headers = parseRow(header).map((h, i) => `<th style="text-align:${aligns[i] || 'left'}">${h}</th>`).join('');

    const bodyHtml = body.map(row => {
      return '<tr>' + parseRow(row).map((c, i) => `<td style="text-align:${aligns[i] || 'left'}">${c}</td>`).join('') + '</tr>';
    }).join('');

    return `<table><thead><tr>${headers}</tr></thead><tbody>${bodyHtml}</tbody></table>`;
  }
}

// ========== 公开 API ==========

/**
 * 解析 Markdown 文件/字符串
 */
export function parseMarkdown(input, isFilePath = true) {
  const raw = isFilePath ? fs.readFileSync(input, 'utf-8') : input;
  const { meta, body } = parseFrontMatter(raw);
  const html = renderMarkdown(body);
  const excerpt = meta.excerpt || body.replace(/[#*`\[\]()!_~>|-]/g, '').replace(/\s+/g, ' ').slice(0, 200).trim();

  return {
    ...meta,
    content: html,
    rawContent: body,
    excerpt,
    wordCount: body.replace(/[^\u4e00-\u9fff\w]/g, '').length,
    readingTime: Math.max(1, Math.ceil(body.replace(/[^\u4e00-\u9fff\w]/g, '').length / 400))
  };
}

/**
 * 批量解析 posts 目录
 */
export function parsePosts(postsDir) {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
  return files.map(f => {
    const filePath = path.join(postsDir, f);
    const slug = f.replace(/\.md$/, '');
    return { slug, filePath, ...parseMarkdown(filePath) };
  });
}
