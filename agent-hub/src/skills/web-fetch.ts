/**
 * Web Fetch Skill — browser-native, zero-server
 *
 * Fetches and extracts text content from URLs.
 * Uses direct fetch (CORS-permitting sites), falls back to textise dot iitty.
 */

interface SkillInput {
  url: string;
  maxLength?: number;
}

interface SkillOutput {
  url: string;
  title: string;
  content: string;
  truncated: boolean;
}

async function fetchDirect(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const resp = await fetch(url, {
      signal: controller.signal,
      headers: { 'Accept': 'text/html,application/xhtml+xml' },
    });
    clearTimeout(timeout);

    if (!resp.ok) return null;
    return await resp.text();
  } catch {
    return null;
  }
}

async function fetchViaTextise(url: string): Promise<string | null> {
  try {
    const proxyUrl = `https://r.jina.ai/http://${url.replace(/^https?:\/\//, '')}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const resp = await fetch(proxyUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'text/plain' },
    });
    clearTimeout(timeout);

    if (!resp.ok) return null;
    return await resp.text();
  } catch {
    return null;
  }
}

function extractText(html: string): { title: string; content: string } {
  // Basic HTML-to-text extraction
  let title = '';
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) {
    title = decodeEntities(titleMatch[1].trim());
  }

  // Remove scripts, styles, and non-content elements
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, ' ')
    .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return { title, content: text };
}

function decodeEntities(text: string): string {
  const txt = document.createElement('textarea');
  txt.innerHTML = text;
  return txt.value;
}

export async function execute(input: SkillInput): Promise<SkillOutput> {
  const url = input.url;
  const maxLength = input.maxLength || 4000;

  // Try direct fetch first
  let html = await fetchDirect(url);

  // Fallback to textise
  if (!html) {
    html = await fetchViaTextise(url);
  }

  if (!html) {
    return {
      url,
      title: 'Error',
      content: 'Unable to fetch this URL. The site may block cross-origin requests.',
      truncated: false,
    };
  }

  const { title, content } = extractText(html);
  const truncated = content.length > maxLength;
  const finalContent = truncated ? content.slice(0, maxLength) + '...' : content;

  return {
    url,
    title: title || url,
    content: finalContent,
    truncated,
  };
}

export const skillMeta = {
  id: 'web-fetch',
  name: 'Web Fetch',
  description: 'Fetch and extract readable text from any webpage. Handles HTML parsing.',
  category: 'Network',
  parameters: {
    url: {
      type: 'string',
      description: 'The URL to fetch content from',
      required: true,
    },
    maxLength: {
      type: 'number',
      description: 'Maximum character length (default 4000)',
      required: false,
    },
  },
};
