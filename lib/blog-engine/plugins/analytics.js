/**
 * 访问统计注入插件 — 支持多种统计服务
 */
export function injectAnalytics(config) {
  const provider = config.analytics?.provider || '';

  switch (provider) {
    case 'umami':
      return `<!-- Umami -->
<script async src="${config.analytics.umamiSrc || 'https://umami.example.com/script.js'}" data-website-id="${config.analytics.umamiId || ''}"></script>`;
    case 'plausible':
      return `<!-- Plausible -->
<script defer data-domain="${config.analytics.domain || ''}" src="${config.analytics.plausibleSrc || 'https://plausible.io/js/script.js'}"></script>`;
    case 'google':
      return `<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${config.analytics.googleId || ''}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${config.analytics.googleId || ''}');</script>`;
    default:
      if (provider) {
        return `<!-- ${provider} analytics placeholder -->`;
      }
      return '';
  }
}
