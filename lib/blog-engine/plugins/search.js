/**
 * 客户端搜索插件 — 基于预生成索引
 */
export function injectSearch(config) {
  if (!config.search?.enabled) return '';

  return `<!-- HanBlog Client-Side Search -->
<script>
(async function() {
  const searchContainer = document.getElementById('search-results');
  const searchInput = document.getElementById('search-input');
  if (!searchContainer || !searchInput) return;

  let idx = [];
  try {
    const resp = await fetch('/search-index.json');
    idx = await resp.json();
  } catch(e) { return; }

  function tokenize(text) {
    return (text || '').toLowerCase().replace(/[^\\w\\u4e00-\\u9fff\\s]/g, ' ').split(/\\s+/).filter(w => w.length > 1);
  }

  searchInput.addEventListener('input', function() {
    const q = this.value.trim();
    if (!q) { searchContainer.innerHTML = ''; return; }
    const terms = tokenize(q);
    const results = idx.map(item => {
      let score = 0;
      const tl = item.title.toLowerCase();
      for (const t of terms) {
        if (tl.includes(t)) score += 10;
        for (const kw of item.keywords || []) {
          if (kw.includes(t)) score++;
        }
      }
      return {...item, score};
    }).filter(r => r.score > 0).sort((a,b) => b.score - a.score).slice(0, 10);

    searchContainer.innerHTML = results.length
      ? results.map(r => \`<a href="/posts/\${r.slug}/" class="search-hit"><span class="hit-title">\${r.title}</span><span class="hit-desc">\${r.excerpt || ''}</span></a>\`).join('')
      : '<div class="search-empty">未找到相关文章</div>';
  });
})();
</script>`;
}
