/**
 * Web Search Skill — browser-native, zero-server
 *
 * Uses public SearXNG instances for search queries.
 * Falls back to DuckDuckGo Lite HTML parsing.
 * All requests originate from the user's browser — no proxy, no API keys.
 */

const SEARXNG_INSTANCES = [
  'https://search.sapti.me',
  'https://searx.be',
  'https://search.inetol.net',
  'https://search.rhscz.eu',
  'https://searx.tiekoetter.com',
];

const DDG_LITE = 'https://lite.duckduckgo.com/lite/';

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SkillInput {
  query: string;
  maxResults?: number;
}

interface SkillOutput {
  results: SearchResult[];
  total: number;
  source: string;
}

async function searchSearXNG(query: string, maxResults: number): Promise<SearchResult[]> {
  for (const base of SEARXNG_INSTANCES) {
    try {
      const url = `${base}/search?q=${encodeURIComponent(query)}&format=json&categories=general&language=en`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const resp = await fetch(url, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeout);

      if (!resp.ok) continue;

      const data = await resp.json();
      const results: SearchResult[] = (data.results || [])
        .slice(0, maxResults)
        .map((r: any) => ({
          title: r.title || '',
          url: r.url || '',
          snippet: r.content || r.snippet || '',
        }));

      if (results.length > 0) return results;
    } catch {
      continue;
    }
  }
  return [];
}

async function searchDDGLite(query: string, maxResults: number): Promise<SearchResult[]> {
  try {
    const formData = new URLSearchParams();
    formData.append('q', query);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const resp = await fetch(DDG_LITE, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!resp.ok) return [];

    const html = await resp.text();
    return parseDDGLiteResults(html, maxResults);
  } catch {
    return [];
  }
}

function parseDDGLiteResults(html: string, maxResults: number): SearchResult[] {
  const results: SearchResult[] = [];
  const rows = html.split('<tr class="result-snippet');

  for (let i = 1; i < rows.length && results.length < maxResults; i++) {
    const row = rows[i];

    const titleMatch = row.match(/<a[^>]*rel="nofollow"[^>]*>([^<]+)<\/a>/);
    const urlMatch = row.match(/<a[^>]*class="link-text"[^>]*href="([^"]+)"/);
    const snippetMatch = row.match(/<td class="result-snippet">([^<]*)</);

    if (titleMatch && snippetMatch) {
      results.push({
        title: decodeHTMLEntities(titleMatch[1].trim()),
        url: urlMatch ? urlMatch[1] : '',
        snippet: decodeHTMLEntities(snippetMatch[1].trim()),
      });
    }
  }

  return results;
}

function decodeHTMLEntities(text: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = text;
  return txt.value;
}

/**
 * Execute the web search skill.
 * Called by the Agent during function-calling.
 */
export async function execute(input: SkillInput): Promise<SkillOutput> {
  const query = input.query;
  const maxResults = Math.min(input.maxResults || 8, 15);

  // Try SearXNG first
  let results = await searchSearXNG(query, maxResults);
  let source = 'SearXNG';

  // Fallback to DDG Lite
  if (results.length === 0) {
    results = await searchDDGLite(query, maxResults);
    source = 'DuckDuckGo Lite';
  }

  return {
    results,
    total: results.length,
    source,
  };
}

/**
 * Skill metadata for the registry.
 */
export const skillMeta = {
  id: 'web-search',
  name: 'Web Search',
  description: 'Search the web using public SearXNG instances. No API keys or servers needed — all requests originate from your browser.',
  category: 'Network',
  parameters: {
    query: {
      type: 'string',
      description: 'The search query',
      required: true,
    },
    maxResults: {
      type: 'number',
      description: 'Maximum number of results (1-15, default 8)',
      required: false,
    },
  },
};
