const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

// Read API key from Vite env var (set in Vercel) or passed explicitly
const ENV_KEY = import.meta.env.VITE_ANTHROPIC_KEY || '';

const SYSTEM_PROMPT = 'You are the editor for Code, Curiosity & Clarity by Julicast. Return ONLY valid JSON. No markdown, no backticks, no extra text. Write like a 23-year-old who\'s lowkey obsessed with this stuff. Casual, direct, zero corporate speak. Use "lowkey", "fr", "tbh", "honestly", "literally" naturally. Short punchy sentences. Emoji where it fits 🔥 but don\'t overdo it. Summaries must be 1-2 sentences MAX. Never say "leverage", "synergize", "optimize", "ecosystem", "utilize". If a story comes from a podcast, format the source as "🎙️ Podcast Name".';

export async function fetchTabData(prompt, apiKey) {
  const key = apiKey || ENV_KEY;
  if (!key) {
    throw new Error('No API key available for live refresh. Data will load from the weekly pre-generated files.');
  }

  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': key,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  };

  const body = {
    model: MODEL,
    max_tokens: 2000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const textBlocks = data.content.filter((b) => b.type === 'text');
  const raw = textBlocks.map((b) => b.text).join('');
  const noCites = raw.replace(/<\/?cite[^>]*>/g, '');
  const cleaned = noCites.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1) throw new Error('No JSON object found in response');
  return JSON.parse(cleaned.slice(first, last + 1));
}
