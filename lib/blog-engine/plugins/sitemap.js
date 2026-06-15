/**
 * 站点地图生成插件
 */
export function generateSitemap(posts, config) {
  const baseURL = config.baseURL;
  if (!baseURL) return '';

  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily', lastmod: new Date().toISOString().split('T')[0] },
    { url: '/archive', priority: '0.8', changefreq: 'weekly' }
  ];

  for (const post of posts) {
    pages.push({
      url: `/posts/${post.slug}/`,
      priority: '0.6',
      changefreq: 'monthly',
      lastmod: (post.updated || post.date || new Date().toISOString()).split('T')[0]
    });
  }

  const tags = new Set();
  for (const post of posts) {
    for (const t of (post.tags || [])) tags.add(t);
  }
  for (const t of tags) {
    pages.push({ url: `/tags/${t}/`, priority: '0.4', changefreq: 'weekly' });
  }

  const urls = pages.map(p => `  <url>
    <loc>${baseURL}${p.url}</loc>
    <lastmod>${p.lastmod || new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
