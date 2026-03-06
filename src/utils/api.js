const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-20250514';

export async function fetchTabData(prompt, apiKey) {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  };

  const body = {
    model: MODEL,
    max_tokens: 2000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    system: 'You are the editor for Code, Curiosity & Clarity by Julicast. Return ONLY valid JSON. No markdown, no backticks, no extra text. Write like a smart Gen Z girl texting her bestie about cool stuff. Think "Ok so basically...", "This is actually wild —", "You NEED to know about this". Summaries must be 1-2 sentences MAX. No corporate buzzwords. If a story comes from a podcast, format the source as "🎙️ Podcast Name".',
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
