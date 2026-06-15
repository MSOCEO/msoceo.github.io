/**
 * RSS / Atom Feed 生成插件
 */
export function generateRSS(config, posts) {
  const baseURL = config.baseURL;
  if (!baseURL) return '';

  const items = posts.slice(0, 20).map(p => `    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${baseURL}/posts/${p.slug}/</link>
      <guid>${baseURL}/posts/${p.slug}/</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description><![CDATA[${p.excerpt || ''}]]></description>
      ${p.tags ? p.tags.map(t => `<category>${t}</category>`).join('\n') : ''}
    </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
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
}

export function generateAtom(config, posts) {
  const baseURL = config.baseURL;
  if (!baseURL) return '';

  const entries = posts.slice(0, 20).map(p => `    <entry>
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
