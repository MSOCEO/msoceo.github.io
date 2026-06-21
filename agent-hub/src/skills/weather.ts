/**
 * Weather Skill
 * Fetches weather data from wttr.in (no API key needed).
 */

interface SkillInput {
  city: string;
  format?: 'full' | 'simple';
}

interface SkillOutput {
  city: string;
  condition: string;
  temperature: string;
  humidity: string;
  wind: string;
  raw: string;
}

async function fetchWeatherRaw(city: string): Promise<string> {
  const url = `https://wttr.in/${encodeURIComponent(city)}?format=%C|%t|%h|%w`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

  try {
    const resp = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!resp.ok) throw new Error('Weather service unavailable');
    return await resp.text();
  } catch {
    clearTimeout(timeout);
    throw new Error('Unable to fetch weather data');
  }
}

export async function execute(input: SkillInput): Promise<SkillOutput> {
  const city = input.city;

  try {
    const raw = await fetchWeatherRaw(city);
    const parts = raw.trim().split('|');

    return {
      city,
      condition: parts[0]?.trim() || 'Unknown',
      temperature: parts[1]?.trim() || 'N/A',
      humidity: parts[2]?.trim() || 'N/A',
      wind: parts[3]?.trim() || 'N/A',
      raw,
    };
  } catch (e: any) {
    return {
      city,
      condition: 'Error',
      temperature: 'N/A',
      humidity: 'N/A',
      wind: 'N/A',
      raw: e.message,
    };
  }
}

export const skillMeta = {
  id: 'weather',
  name: 'Weather',
  description: 'Get current weather for any city using wttr.in. No API key needed.',
  category: 'Data',
  parameters: {
    city: {
      type: 'string',
      description: 'City name (e.g., "Beijing", "Tokyo")',
      required: true,
    },
  },
};
