/**
 * SEO 优化插件 — 注入 meta tags、OG、Twitter Card
 */
export function injectSEO(config, post) {
  const title = post ? `${post.title} · ${config.title}` : config.title;
  const desc = post?.excerpt || config.subtitle || '';
  const url = config.baseURL + (post ? `/posts/${post.slug}/` : '/');
  const img = config.ogImage || '';

  return `
<meta name="description" content="${desc}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:type" content="${post ? 'article' : 'website'}">
<meta property="og:site_name" content="${config.title}">
${img ? `<meta property="og:image" content="${img}">` : ''}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
${img ? `<meta name="twitter:image" content="${img}">` : ''}
<meta name="robots" content="index,follow">
<link rel="canonical" href="${url}">
${post?.tags ? post.tags.map(t => `<meta property="article:tag" content="${t}">`).join('\n') : ''}
`.trim();
}
