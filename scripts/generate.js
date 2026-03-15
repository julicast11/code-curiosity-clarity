/**
 * Weekly content generator for Code, Curiosity & Clarity.
 *
 * THREE MODES (auto-detected):
 *   1. RSS + Gemini (recommended free tier) — set GEMINI_API_KEY
 *   2. RSS only (100% free, no API needed) — no env vars required
 *   3. Claude API (paid) — set ANTHROPIC_API_KEY
 *
 * Usage:
 *   node scripts/generate.js                          # RSS-only mode
 *   GEMINI_API_KEY=... node scripts/generate.js       # RSS + Gemini
 *   ANTHROPIC_API_KEY=... node scripts/generate.js    # Claude API mode
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import Parser from 'rss-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'public', 'data');
const parser = new Parser({ timeout: 10000 });

// ── Mode detection ────────────────────────────────────────────────

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const GEMINI_KEY = process.env.GEMINI_API_KEY;

let geminiModel = null;

if (ANTHROPIC_KEY) {
  console.log('Mode: Claude API (paid)');
} else if (GEMINI_KEY) {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(GEMINI_KEY);
  geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log('Mode: RSS + Gemini Flash (free tier)');
} else {
  console.log('Mode: RSS only (no API key)');
}

// ── Known podcasts ───────────────────────────────────────────────

const KNOWN_PODCASTS = [
  'my first million', 'acquired', 'all-in', 'all-in podcast', 'lex fridman',
  'lex fridman podcast', 'the ai podcast', 'latent space', 'gradient dissent',
  'practical ai', 'hard fork', 'pivot', 'the vergecast', 'decoder',
  'stratechery', 'exponent', 'invest like the best', 'the knowledge project',
  'freakonomics', 'how i built this', 'masters of scale', 'the prof g pod',
  'the tim ferriss show', 'a16z podcast', 'eye on ai', 'the logan bartlett show',
  'no priors', 'cognitive revolution', 'last week in ai', 'dwarkesh podcast',
  'bankless', 'upstream', 'the pitch', '20vc', 'this week in startups',
];

function isPodcast(source) {
  if (!source) return false;
  const lower = source.toLowerCase().trim();
  return KNOWN_PODCASTS.some(p => lower.includes(p) || p.includes(lower));
}

function formatSource(source) {
  if (isPodcast(source)) return `🎙️ ${source}`;
  return source;
}

// ── Date helpers ──────────────────────────────────────────────────

function getLastWeekRange() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diffToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - diffToLastMonday - 7);
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);
  const fmt = (d) => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}`;
  };
  return `${fmt(lastMonday)} – ${fmt(lastSunday)}`;
}

const week = getLastWeekRange();

// ── Tone instructions ────────────────────────────────────────────

const TONE_INSTRUCTIONS = `Write casually like a 23yo texting — use "lowkey", "fr", "tbh", "literally" naturally. 1-2 sentence summaries MAX. No corporate speak. Emoji sparingly. If a story comes from a podcast, format the source as "🎙️ Podcast Name".`;

// ── Tab definitions with RSS queries ──────────────────────────────

const TABS = [
  // AI section
  {
    id: 'tools-to-try',
    label: 'Tools to Try',
    section: 'AI',
    query: '"new AI tool" OR "AI app launch" OR "AI productivity tool" OR "best AI tools"',
    feeds: [],
    schema: 'picks',
    promptHint: 'Focus on new AI tools worth trying this week. Include pricing info (free/freemium/paid).',
  },
  {
    id: 'ai-business',
    label: 'AI in Business',
    section: 'AI',
    query: '"AI in business" OR "enterprise AI adoption" OR "artificial intelligence enterprise" OR "AI ROI"',
    feeds: ['https://www.technologyreview.com/feed/'],
    schema: 'stories',
    promptHint: 'Focus on enterprise AI adoption, ROI cases, and industry transformation.',
  },
  {
    id: 'models-releases',
    label: 'Models & Releases',
    section: 'AI',
    query: '"AI model release" OR "LLM launch" OR "GPT-" OR "Claude" OR "Gemini AI model" OR "Llama model"',
    feeds: ['https://the-decoder.com/feed/', 'https://huggingface.co/blog/feed.xml'],
    schema: 'stories',
    promptHint: 'Cover OpenAI, Anthropic, Google, Meta, Mistral model releases and benchmarks.',
  },
  {
    id: 'vibe-coding',
    label: 'Vibe Coding',
    section: 'AI',
    query: '"vibe coding" OR "AI coding assistant" OR "Cursor AI" OR "GitHub Copilot" OR "Claude Code" OR "Replit Agent"',
    feeds: ['https://simonwillison.net/atom/everything/', 'https://github.blog/feed/'],
    schema: 'stories',
    promptHint: 'Focus on Cursor, Copilot, Claude Code, Replit Agent, v0, Bolt, and similar AI dev tools.',
  },
  // Consulting section (3 tabs)
  {
    id: 'skills-tools',
    label: 'Skills & Tools',
    section: 'Consulting',
    query: '"Python for consultants" OR "Excel tips" OR "SQL analytics" OR "data visualization" OR "financial modeling Excel"',
    feeds: ['https://realpython.com/atom.xml'],
    schema: 'stories',
    storyCount: 3,
    promptHint: 'Pick EXACTLY 3 stories: one skill to learn (Python, SQL, Tableau), one Excel/data tip, one useful tool or shortcut. US-focused only.',
  },
  {
    id: 'life-at-stax',
    label: 'Life at Stax',
    section: 'Consulting',
    query: '"private equity consulting" OR "PE consultant career" OR "management consulting advice" OR "Stax consulting" OR "boutique consulting"',
    feeds: [],
    schema: 'stories',
    storyCount: 3,
    promptHint: 'Pick EXACTLY 3 stories: one PE/consulting industry news, one about sectors Stax covers (consumer, healthcare, industrials, tech), one career tip. US-focused only.',
  },
  {
    id: 'ai-consulting',
    label: 'AI in Consulting',
    section: 'Consulting',
    query: '"AI consulting" OR "McKinsey AI" OR "BCG AI" OR "Deloitte AI" OR "consulting firm artificial intelligence"',
    feeds: [],
    schema: 'stories',
    storyCount: 3,
    promptHint: 'Pick EXACTLY 3 stories about how AI is changing consulting. Focus on McKinsey, BCG, Bain, Deloitte, Accenture, boutique firms. US-focused only.',
  },
  // Strategy section
  {
    id: 'tech-strategy',
    label: 'Tech-Driven Strategy Shifts',
    section: 'Strategy',
    query: '"AI strategy" OR "digital transformation strategy" OR "technology strategy shift" OR "tech disruption" OR "AI business strategy"',
    feeds: [],
    schema: 'stories',
    promptHint: 'Focus on companies making strategic shifts due to AI and technology.',
  },
  {
    id: 'value-creation',
    label: 'Value Creation',
    section: 'Strategy',
    query: 'private equity value creation OR "PE portfolio" OR "private equity growth" OR buyout strategy OR "PE-backed"',
    feeds: [],
    schema: 'stories',
    promptHint: 'Return exactly 4 stories, one from each sector: Consumer, Industrials, Healthcare, Tech. Each story must have its sector badge. Do not saturate any single sector.',
  },
  // South Florida section
  {
    id: 'sfl-tech',
    label: 'Tech & Startups',
    section: 'South Florida',
    query: '"Miami tech" OR "South Florida startup" OR "Miami startup" OR "Fort Lauderdale tech" OR "Miami venture capital"',
    feeds: ['https://www.miamiherald.com/news/business/technology/rss', 'https://refreshmiami.com/feed/', 'https://www.axios.com/local/miami/feed.xml'],
    schema: 'stories',
    promptHint: 'Focus on Miami/South Florida tech ecosystem, startups, VC activity.',
  },
  {
    id: 'sfl-ai-jobs',
    label: 'AI & Jobs',
    section: 'South Florida',
    query: 'Miami tech jobs OR Florida AI jobs OR "South Florida hiring" OR Miami careers technology OR Florida tech employment',
    feeds: ['https://www.miamiherald.com/news/business/rss', 'https://www.axios.com/local/miami/feed.xml'],
    schema: 'stories',
    promptHint: 'Focus on AI jobs, consulting hiring, tech job openings in South Florida.',
  },
  {
    id: 'sfl-business',
    label: 'Business & Economy',
    section: 'South Florida',
    query: '"South Florida business" OR "Miami economy" OR "South Florida real estate" OR "Miami finance"',
    feeds: ['https://www.bizjournals.com/southflorida/feed/headlines/rss', 'https://www.miamiherald.com/news/business/rss', 'https://www.axios.com/local/miami/feed.xml'],
    schema: 'stories',
    promptHint: 'Focus on Miami/South Florida business news, real estate, finance, PE/VC activity.',
  },
];

// ── RSS fetching ──────────────────────────────────────────────────

function googleNewsUrl(query) {
  const q = encodeURIComponent(query + ' when:7d');
  return `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
}

async function resolveGoogleNewsUrl(url) {
  if (!url || !url.includes('news.google.com')) return url;
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(5000) });
    return res.url || url;
  } catch {
    return url;
  }
}

async function fetchFeed(url) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items || [];
  } catch (err) {
    console.warn(`    Feed failed: ${url} (${err.message})`);
    return [];
  }
}

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSource(item) {
  let src;
  if (item.source) src = item.source;
  else if (item.creator) src = item.creator;
  else if (item.link) {
    try {
      src = new URL(item.link).hostname.replace('www.', '');
    } catch { src = 'Unknown'; }
  } else {
    src = 'Unknown';
  }
  return formatSource(src);
}

async function fetchTabArticles(tab) {
  const allItems = [];

  // Fetch Google News RSS
  const gnUrl = googleNewsUrl(tab.query);
  const gnItems = await fetchFeed(gnUrl);
  allItems.push(...gnItems);

  // Fetch specific RSS feeds
  for (const feedUrl of tab.feeds) {
    const items = await fetchFeed(feedUrl);
    allItems.push(...items);
  }

  // Deduplicate by title similarity & sort by date
  const seen = new Set();
  const unique = allItems.filter(item => {
    const key = (item.title || '').toLowerCase().slice(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  unique.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate) : new Date(0);
    const dateB = b.pubDate ? new Date(b.pubDate) : new Date(0);
    return dateB - dateA;
  });

  const top = unique.slice(0, 10);

  // Resolve Google News redirect URLs to actual article URLs
  await Promise.all(top.map(async (item) => {
    if (item.link && item.link.includes('news.google.com')) {
      item.link = await resolveGoogleNewsUrl(item.link);
    }
  }));

  return top;
}

// ── RSS-only JSON builders ────────────────────────────────────────

function buildStoriesJson(tab, articles) {
  const count = tab.storyCount || 4;
  const stories = articles.slice(0, count).map(a => ({
    title: cleanHtml(a.title) || 'Untitled',
    summary: cleanHtml(a.contentSnippet || a.content || a.description || '').slice(0, 300),
    takeaway: '',
    source: extractSource(a),
    url: a.link || '',
    tag: tab.section,
    ...(tab.id.includes('strategy') ? { strategyTake: '' } : {}),
  }));

  const watchNext = articles.slice(count, count + 2).map(a => ({
    title: cleanHtml(a.title) || 'Untitled',
    why: cleanHtml(a.contentSnippet || a.description || '').slice(0, 120),
    url: a.link || '',
    tag: tab.section,
  }));

  return {
    headline: `Top ${tab.label} stories this week`,
    stories,
    watchNext,
  };
}

function buildPicksJson(tab, articles) {
  const picks = articles.slice(0, 4).map(a => ({
    name: cleanHtml(a.title) || 'Untitled',
    tagline: '',
    summary: cleanHtml(a.contentSnippet || a.description || '').slice(0, 300),
    tryIt: '',
    url: a.link || '',
    tag: 'AI Tool',
    vibe: 'freemium',
    bestFor: '',
  }));

  return {
    headline: `Top ${tab.label} this week`,
    picks,
    watchNext: articles.slice(4, 6).map(a => ({
      title: cleanHtml(a.title) || 'Untitled',
      why: cleanHtml(a.contentSnippet || '').slice(0, 120),
      url: a.link || '',
      tag: tab.section,
    })),
  };
}

function buildRssJson(tab, articles) {
  if (tab.schema === 'picks') return buildPicksJson(tab, articles);
  return buildStoriesJson(tab, articles);
}

// ── Gemini enhancement ────────────────────────────────────────────

async function enhanceWithGemini(tab, articles) {
  if (!geminiModel) return null;

  const articleList = articles.slice(0, 8).map((a, i) =>
    `${i + 1}. "${cleanHtml(a.title)}" — ${cleanHtml(a.contentSnippet || a.description || '').slice(0, 200)} (Source: ${extractSource(a)}, URL: ${a.link || ''})`
  ).join('\n');

  const storyCount = tab.storyCount || 4;

  let schemaDesc;
  if (tab.schema === 'picks') {
    schemaDesc = `{"headline":"string","picks":[{"name":"string","tagline":"string","summary":"string","tryIt":"string","url":"string","tag":"string","vibe":"free|freemium|paid","bestFor":"string"}],"watchNext":[{"title":"string","why":"string","url":"string","tag":"string"}]}. Include 4 picks and 2 watchNext.`;
  } else {
    schemaDesc = `{"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","url":"string","tag":"string"}],"watchNext":[{"title":"string","why":"string","url":"string","tag":"string"}]}. Include ${storyCount} stories and 2 watchNext.`;
  }

  const prompt = `You are the editor for a weekly intelligence dashboard called "Code, Curiosity & Clarity."

Here are the latest articles for the "${tab.label}" section:

${articleList}

Based on these articles, generate a JSON digest for this week. ${tab.promptHint}

IMPORTANT: You MUST use the original URL from each article in the "url" field. Do NOT make up URLs. Only include stories from reputable, well-known sources (major news outlets, industry publications, established tech blogs). Skip low-quality or unknown sources.

${TONE_INSTRUCTIONS}

Return ONLY valid JSON matching this schema:
${schemaDesc}

Make the headline punchy and fun. No markdown, no backticks, no extra text — just the JSON object.`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.warn(`    Gemini enhancement failed: ${err.message}`);
    return null;
  }
}

// ── Claude API (paid fallback) ────────────────────────────────────

async function callClaude(prompt) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      system: `You are the editor for Code, Curiosity & Clarity by Julicast. Return ONLY valid JSON. No markdown, no backticks, no extra text. ${TONE_INSTRUCTIONS}`,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API ${res.status}: ${err}`);
  }

  const data = await res.json();
  const textBlocks = data.content.filter((b) => b.type === 'text');
  const raw = textBlocks.map((b) => b.text).join('');
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleaned);
}

// Claude prompts (only used in Claude mode)
function getClaudePrompt(tab) {
  const t = TONE_INSTRUCTIONS;

  const prompts = {
    'tools-to-try': `Search the web for the best new AI tools released or trending during the week of ${week}. Prioritize content from: There's An AI For That, Product Hunt AI category, Ben's Bites, The Neuron, Future Tools (Matt Wolfe), TLDR AI newsletter. Return JSON: {"headline":"string","picks":[{"name":"string","tagline":"string","summary":"string","tryIt":"string","url":"string","tag":"string","vibe":"free|freemium|paid","bestFor":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 tool picks and 2 watchNext. ${t}`,
    'ai-business': `Search the web for the latest AI in business news from the week of ${week}. Prioritize content from: One Useful Thing (Ethan Mollick), Benedict Evans, MIT Technology Review, Harvard Business Review, McKinsey QuantumBlack, a16z AI content, CB Insights, and The Information. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","industry":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories with industry badges and 2 watchNext. ${t}`,
    'models-releases': `Search the web for the latest AI model releases and updates from the week of ${week}. Prioritize PRIMARY sources: OpenAI Blog, Anthropic News, Google DeepMind Blog, Meta AI Blog, Hugging Face Blog. Also check The Decoder, Ars Technica AI section, and Papers With Code for benchmarks. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","company":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories with company badges and 2 watchNext. ${t}`,
    'vibe-coding': `Search the web for the latest vibe coding and AI-assisted development news from the week of ${week}. Prioritize content from: Simon Willison's Weblog, Latent Space newsletter, The Pragmatic Engineer, Cursor Blog, GitHub Blog (Copilot), Anthropic News (Claude Code). Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","type":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext. Focus on Cursor, Copilot, Claude Code, Replit Agent, v0, Bolt. ${t}`,
    'skills-tools': `Search the web for the best skill to learn, Excel/data tip, and useful tool for management consultants from the week of ${week}. Focus on US-based sources. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","skill":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include EXACTLY 3 stories: one skill to learn, one Excel/data tip, one useful tool. Include 2 watchNext. US-focused only. ${t}`,
    'life-at-stax': `Search the web for news relevant to someone working at Stax (a PE-focused management consulting firm) from the week of ${week}. Focus on US-based sources. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include EXACTLY 3 stories: one PE/consulting industry news, one about sectors Stax covers (consumer, healthcare, industrials, tech), one career tip. Include 2 watchNext. US-focused only. ${t}`,
    'ai-consulting': `Search the web for news about AI in management consulting from the week of ${week}. Focus on US-based sources. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","tool":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include EXACTLY 3 stories and 2 watchNext. Focus on McKinsey, BCG, Bain, Deloitte, Accenture. US-focused only. ${t}`,
    'tech-strategy': `Search the web for companies making strategic shifts due to AI and technology in ${week}. Prioritize content from: McKinsey Digital, BCG Henderson Institute, Stratechery, MIT Sloan Management Review, Harvard Business Review, The Information, Financial Times. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","company":"string","shift":"long-term|short-term","strategyTake":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext. ${t}`,
    'value-creation': `Search the web for private equity value creation case studies and strategies from ${week}. Prioritize content from: Bain Global PE Report, McKinsey Private Equity insights, PitchBook News, PE Hub, Private Equity International, Buyouts Insider, BCG Private Equity insights, Mergermarket. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string","lever":"Revenue growth|Margin expansion|Digital transformation"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Return exactly 4 stories, one from each sector: Consumer, Industrials, Healthcare, Tech. Include 2 watchNext. ${t}`,
    'sfl-tech': `Search the web for South Florida technology and startup news from the week of ${week}. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext. ${t}`,
    'sfl-ai-jobs': `Search the web for AI and job market news in South Florida from the week of ${week}. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext. ${t}`,
    'sfl-business': `Search the web for South Florida business and economic news from the week of ${week}. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext. ${t}`,
  };
  return prompts[tab.id];
}

// ── Main ──────────────────────────────────────────────────────────

async function main() {
  mkdirSync(DATA_DIR, { recursive: true });

  console.log(`\nGenerating content for week of ${week}`);
  console.log(`Output: ${DATA_DIR}\n`);

  const meta = {
    generatedAt: new Date().toISOString(),
    weekRange: week,
  };
  writeFileSync(join(DATA_DIR, '_meta.json'), JSON.stringify(meta, null, 2));

  for (const tab of TABS) {
    const label = tab.id.padEnd(18);
    process.stdout.write(`  ${label} ... `);

    try {
      let result;

      if (ANTHROPIC_KEY) {
        // Claude API mode (paid)
        result = await callClaude(getClaudePrompt(tab));
      } else {
        // RSS mode (free)
        const articles = await fetchTabArticles(tab);

        if (articles.length === 0) {
          console.log('no articles found');
          continue;
        }

        // Try Gemini enhancement, fall back to raw RSS
        const enhanced = await enhanceWithGemini(tab, articles);
        result = enhanced || buildRssJson(tab, articles);
      }

      const outPath = join(DATA_DIR, `${tab.id}.json`);
      writeFileSync(outPath, JSON.stringify(result, null, 2));
      console.log(`done (${ANTHROPIC_KEY ? 'claude' : geminiModel ? 'gemini' : 'rss'})`);
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }

    // Small delay between calls
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log('\nGeneration complete.');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
