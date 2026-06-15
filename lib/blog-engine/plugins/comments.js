/**
 * 评论系统注入插件 — Giscus (基于 GitHub Discussions)
 */
export function injectComments(config) {
  const provider = config.comments?.provider || '';

  switch (provider) {
    case 'giscus':
      return `<!-- Giscus Comments -->
<section class="comments">
  <script src="https://giscus.app/client.js"
    data-repo="${config.comments.giscusRepo || ''}"
    data-repo-id="${config.comments.giscusRepoId || ''}"
    data-category="${config.comments.giscusCategory || 'Announcements'}"
    data-category-id="${config.comments.giscusCategoryId || ''}"
    data-mapping="${config.comments.giscusMapping || 'pathname'}"
    data-strict="0"
    data-reactions-enabled="1"
    data-emit-metadata="0"
    data-input-position="bottom"
    data-theme="${config.comments.giscusTheme || 'preferred_color_scheme'}"
    data-lang="${config.language || 'zh-CN'}"
    crossorigin="anonymous"
    async>
  </script>
</section>`;
    case 'utterances':
      return `<!-- Utterances Comments -->
<section class="comments">
  <script src="https://utteranc.es/client.js"
    repo="${config.comments.utterancesRepo || ''}"
    issue-term="pathname"
    theme="${config.comments.utterancesTheme || 'preferred-color-scheme'}"
    crossorigin="anonymous"
    async>
  </script>
</section>`;
    default:
      return '';
  }
}
