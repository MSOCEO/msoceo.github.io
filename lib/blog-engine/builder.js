/**
 * 寒影博客引擎 — 构建器
 * 扫描 posts/ → 解析 → 渲染模板 → 输出静态 HTML → 复制资源
 */

import fs from 'fs';
import path from 'path';
import { parsePosts } from './parser.js';
import { sortPosts, paginate, aggregateTaxonomies, formatDate, generateRSS, generateAtom, generateSitemap, generateSearchIndex, renderTemplate } from './engine.js';

export async function build(config = {}) {
  const defaultConfig = {
    title: '我的博客',
    subtitle: '',
    author: '',
    theme: 'default',
    language: 'zh-CN',
    postsPerPage: 10,
    baseURL: '',
    nav: [
      { label: '首页', url: '/' },
      { label: '归档', url: '/archive' }
    ],
    social: {}
  };
  const cfg = { ...defaultConfig, ...config };

  const srcDir = cfg.sourceDir || path.resolve('posts');
  const outDir = cfg.outputDir || path.resolve('public');
  const themeDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'themes', cfg.theme);

  // 清空输出目录
  if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true });
  fs.mkdirSync(outDir, { recursive: true });

  // 解析文章
  const allPosts = parsePosts(srcDir);
  const sorted = sortPosts(allPosts);
  const { tags, categories } = aggregateTaxonomies(sorted);
  const searchIndex = generateSearchIndex(sorted);

  // 读取主题模板
  const templates = loadTheme(themeDir);
  const themeCSS = loadThemeCSS(themeDir);

  // 数据上下文
  const ctx = {
    config: cfg, posts: sorted, tags, categories,
    formatDate, currentYear: new Date().getFullYear()
  };

  // 生成首页
  const homePages = paginate(sorted, 1, cfg.postsPerPage);
  for (let p = 1; p <= homePages.totalPages; p++) {
    const page = paginate(sorted, p, cfg.postsPerPage);
    const html = renderTemplate(templates.index, { ...ctx, page });
    const dir = p === 1 ? outDir : path.join(outDir, 'page', String(p));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), wrapHTML(html, cfg.title, cfg, themeCSS));
  }

  // 生成文章页
  for (const post of sorted) {
    const html = renderTemplate(templates.post, { ...ctx, post });
    const dir = path.join(outDir, 'posts', post.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), wrapHTML(html, post.title, cfg, themeCSS));
  }

  // 生成归档页
  if (templates.archive) {
    const html = renderTemplate(templates.archive, ctx);
    const dir = path.join(outDir, 'archive');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), wrapHTML(html, '归档', cfg, themeCSS));
  }

  // 生成标签页
  for (const [tag, data] of Object.entries(tags)) {
    const html = renderTemplate(templates.tag || templates.index, { ...ctx, tag, tagPosts: data.posts });
    const dir = path.join(outDir, 'tags', tag);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), wrapHTML(html, `标签: ${tag}`, cfg, themeCSS));
  }

  // RSS + Atom
  if (cfg.baseURL) {
    const rss = generateRSS(cfg, sorted, cfg.baseURL);
    fs.writeFileSync(path.join(outDir, 'rss.xml'), rss);
    const atom = generateAtom(cfg, sorted, cfg.baseURL);
    fs.writeFileSync(path.join(outDir, 'atom.xml'), atom);
  }

  // 站点地图
  if (cfg.baseURL) {
    const pages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/archive', priority: '0.8' },
      ...sorted.map(p => ({ url: `/posts/${p.slug}/`, priority: '0.6', lastmod: p.date })),
      ...Object.keys(tags).map(t => ({ url: `/tags/${t}/`, priority: '0.4' }))
    ];
    const sitemap = generateSitemap(pages, cfg.baseURL);
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
  }

  // 搜索索引
  const searchJSON = JSON.stringify(searchIndex.index);
  fs.writeFileSync(path.join(outDir, 'search-index.json'), searchJSON);

  // 复制主题静态资源
  const assetsDir = path.join(themeDir, 'assets');
  if (fs.existsSync(assetsDir)) copyDir(assetsDir, path.join(outDir, 'assets'));

  // 生成 .nojekyll
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');

  console.log(`[HanBlog] 构建完成: ${sorted.length} 篇文章 → ${outDir}`);
  return { posts: sorted, outputDir: outDir };
}

// ========== 主题加载 ==========
function loadTheme(themeDir) {
  const templates = {};
  const files = ['index.ejs', 'post.ejs', 'archive.ejs', 'tag.ejs'];
  for (const f of files) {
    const fp = path.join(themeDir, f);
    if (fs.existsSync(fp)) {
      templates[f.replace('.ejs', '')] = fs.readFileSync(fp, 'utf-8');
    }
  }
  return templates;
}

function loadThemeCSS(themeDir) {
  const fp = path.join(themeDir, 'style.css');
  return fs.existsSync(fp) ? fs.readFileSync(fp, 'utf-8') : '';
}

// ========== HTML 包装 ==========
function wrapHTML(body, title, config, css = '') {
  const lang = config.language || 'zh-CN';
  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}${title !== config.title ? ` · ${config.title}` : ''}</title>
  <meta name="description" content="${config.subtitle || ''}">
  <meta name="author" content="${config.author || ''}">
  <link rel="alternate" type="application/rss+xml" href="${config.baseURL}/rss.xml" title="${config.title}">
  <style>${css}</style>
</head>
<body>
  ${body}
</body>
</html>`;
}

// ========== 目录复制 ==========
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
