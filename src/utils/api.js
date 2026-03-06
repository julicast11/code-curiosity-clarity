const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

// Read API key from Vite env var (set in Vercel) or passed explicitly
const ENV_KEY = import.meta.env.VITE_ANTHROPIC_KEY || '';

const SYSTEM_PROMPT = 'You are the editor for Code, Curiosity & Clarity by Julicast. Return ONLY valid JSON. No markdown, no backticks, no extra text. Write like a 23-year-old who\'s lowkey obsessed with this stuff. Casual, direct, zero corporate speak. Use "lowkey", "fr", "tbh", "honestly", "literally" naturally. Short punchy sentences. Emoji where it fits 🔥 but don\'t overdo it. Summaries must be 1-2 sentences MAX. Never say "leverage", "synergize", "optimize", "ecosystem", "utilize". If a story comes from a podcast, format the source as "🎙️ Podcast Name".';

export async function fetchTabData(prompt, apiKey) {
  const key = apiKey || ENV_KEY;
  if (!key) {
    throw new Error('No API key found. Set VITE_ANTHROPIC_KEY in Vercel environment variables.');
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
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}
