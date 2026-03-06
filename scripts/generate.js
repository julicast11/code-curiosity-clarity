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

// ── Tab definitions with RSS queries ──────────────────────────────

const TABS = [
  // AI section
  {
    id: 'vibe-coding',
    label: 'Vibe Coding',
    section: 'AI',
    query: '"vibe coding" OR "AI coding assistant" OR "Cursor AI" OR "GitHub Copilot" OR "Claude Code" OR "Replit Agent"',
    feeds: ['https://simonwillison.net/atom/everything/', 'https://github.blog/feed/'],
    schema: 'stories',
    callout: 'tryThis',
    promptHint: 'Focus on Cursor, Copilot, Claude Code, Replit Agent, v0, Bolt, and similar AI dev tools.',
  },
  {
    id: 'ai-business',
    label: 'AI in Business',
    section: 'AI',
    query: '"AI in business" OR "enterprise AI adoption" OR "artificial intelligence enterprise" OR "AI ROI"',
    feeds: ['https://www.technologyreview.com/feed/'],
    schema: 'stories',
    callout: 'bigPicture',
    promptHint: 'Focus on enterprise AI adoption, ROI cases, and industry transformation.',
  },
  {
    id: 'models-releases',
    label: 'Models & Releases',
    section: 'AI',
    query: '"AI model release" OR "LLM launch" OR "GPT-" OR "Claude" OR "Gemini AI model" OR "Llama model"',
    feeds: ['https://the-decoder.com/feed/', 'https://huggingface.co/blog/feed.xml'],
    schema: 'stories',
    callout: 'tldr',
    promptHint: 'Cover OpenAI, Anthropic, Google, Meta, Mistral model releases and benchmarks.',
  },
  {
    id: 'tools-to-try',
    label: 'Tools to Try',
    section: 'AI',
    query: '"new AI tool" OR "AI app launch" OR "AI productivity tool" OR "best AI tools"',
    feeds: [],
    schema: 'picks',
    callout: null,
    promptHint: 'Focus on new AI tools worth trying this week. Include pricing info (free/freemium/paid).',
  },
  // Consulting section
  {
    id: 'ai-consulting',
    label: 'AI in Consulting',
    section: 'Consulting',
    query: '"AI consulting" OR "McKinsey AI" OR "BCG AI" OR "Deloitte AI" OR "consulting firm artificial intelligence"',
    feeds: [],
    schema: 'stories',
    callout: 'proTip',
    promptHint: 'Focus on how McKinsey, BCG, Bain, Deloitte, Accenture, and boutique firms are using AI.',
  },
  {
    id: 'tech-skills',
    label: 'Tech Skills for Consultants',
    section: 'Consulting',
    query: '"Python for consultants" OR "SQL analytics" OR "data visualization skills" OR "technical skills consulting"',
    feeds: ['https://realpython.com/atom.xml'],
    schema: 'stories',
    callout: 'weeklyChallenge',
    promptHint: 'Focus on Python, SQL, Tableau, Excel automation, AI tools for analysts.',
  },
  {
    id: 'tools-stax',
    label: 'Tools at Stax',
    section: 'Consulting',
    query: '"PitchBook" OR "Capital IQ" OR "private equity tools" OR "PE analyst" OR "FactSet"',
    feeds: [],
    schema: 'tools',
    callout: 'insight',
    promptHint: 'Focus on PitchBook, Capital IQ, FactSet, Tableau, and AI assistants for PE consultants.',
  },
  {
    id: 'excel-stax',
    label: 'Excel at Stax',
    section: 'Consulting',
    query: 'management consulting career advice OR consulting professional development OR "consulting skills" OR "excel at work" consulting',
    feeds: [],
    schema: 'stories',
    callout: 'mantra',
    promptHint: 'Focus on habits, mindsets, communication, and stakeholder management for junior consultants at PE boutiques.',
  },
  // Strategy section
  {
    id: 'tech-strategy',
    label: 'Tech Strategy Shifts',
    section: 'Strategy',
    query: '"AI strategy" OR "digital transformation strategy" OR "technology strategy shift" OR "tech disruption"',
    feeds: [],
    schema: 'stories',
    callout: 'bigSignal',
    promptHint: 'Focus on companies making strategic shifts due to AI and technology.',
  },
  {
    id: 'strategy-news',
    label: 'Strategy in the News',
    section: 'Strategy',
    query: '"business strategy" OR "corporate strategy" OR "strategic pivot" OR "market strategy"',
    feeds: [],
    schema: 'stories',
    callout: 'weeklyFramework',
    promptHint: 'Analyze major business news through a consulting/strategy lens.',
  },
  {
    id: 'value-creation',
    label: 'Value Creation',
    section: 'Strategy',
    query: 'private equity value creation OR "PE portfolio" OR "private equity growth" OR buyout strategy OR "PE-backed"',
    feeds: [],
    schema: 'stories',
    callout: 'playbook',
    promptHint: 'Focus on how PE-backed companies create and capture value.',
  },
  // Industrial & Ops section
  {
    id: 'ie-business',
    label: 'IE Meets Business',
    section: 'Industrial',
    query: '"industrial engineering" OR "operations management" OR "process improvement business" OR "lean six sigma"',
    feeds: [],
    schema: 'stories',
    callout: 'bigPicture',
    promptHint: 'Focus on how IE skills translate to consulting and strategy roles.',
  },
  {
    id: 'ops-innovation',
    label: 'Operations & Innovation',
    section: 'Industrial',
    query: '"smart manufacturing" OR "Industry 4.0" OR "manufacturing innovation" OR "factory automation" OR "digital twin"',
    feeds: [],
    schema: 'stories',
    callout: 'bigPicture',
    promptHint: 'Focus on smart manufacturing, automation, robotics, and operational excellence.',
  },
  {
    id: 'supply-chain',
    label: 'Supply Chain & Logistics',
    section: 'Industrial',
    query: '"supply chain" OR "logistics technology" OR "supply chain disruption" OR "nearshoring"',
    feeds: ['https://www.supplychaindive.com/feeds/news/', 'https://www.freightwaves.com/feed'],
    schema: 'stories',
    callout: 'bigPicture',
    promptHint: 'Focus on global supply chain disruptions, logistics tech, nearshoring, AI in supply chain.',
  },
  // South Florida section
  {
    id: 'sfl-tech',
    label: 'South FL Tech',
    section: 'South Florida',
    query: '"Miami tech" OR "South Florida startup" OR "Miami startup" OR "Fort Lauderdale tech" OR "Miami venture capital"',
    feeds: [],
    schema: 'stories',
    callout: 'bigPicture',
    promptHint: 'Focus on Miami/South Florida tech ecosystem, startups, VC activity.',
  },
  {
    id: 'sfl-ai-jobs',
    label: 'South FL AI & Jobs',
    section: 'South Florida',
    query: 'Miami tech jobs OR Florida AI jobs OR "South Florida hiring" OR Miami careers technology OR Florida tech employment',
    feeds: [],
    schema: 'stories',
    callout: 'bigPicture',
    promptHint: 'Focus on AI jobs, consulting hiring, tech job openings in South Florida.',
  },
  {
    id: 'sfl-business',
    label: 'South FL Business',
    section: 'South Florida',
    query: '"South Florida business" OR "Miami economy" OR "South Florida real estate" OR "Miami finance"',
    feeds: [],
    schema: 'stories',
    callout: 'bigPicture',
    promptHint: 'Focus on Miami/South Florida business news, real estate, finance, PE/VC activity.',
  },
];

// ── RSS fetching ──────────────────────────────────────────────────

function googleNewsUrl(query) {
  const q = encodeURIComponent(query + ' when:7d');
  return `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
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
  if (item.source) return item.source;
  if (item.creator) return item.creator;
  if (item.link) {
    try {
      const hostname = new URL(item.link).hostname.replace('www.', '');
      return hostname;
    } catch { return 'Unknown'; }
  }
  return 'Unknown';
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

  return unique.slice(0, 10); // Top 10 most recent
}

// ── RSS-only JSON builders ────────────────────────────────────────

function buildStoriesJson(tab, articles) {
  const stories = articles.slice(0, 4).map(a => ({
    title: cleanHtml(a.title) || 'Untitled',
    summary: cleanHtml(a.contentSnippet || a.content || a.description || '').slice(0, 300),
    takeaway: '',
    source: extractSource(a),
    url: a.link || '',
    tag: tab.section,
    ...(tab.id.includes('strategy') ? { strategyTake: '' } : {}),
  }));

  const watchNext = articles.slice(4, 6).map(a => ({
    title: cleanHtml(a.title) || 'Untitled',
    why: cleanHtml(a.contentSnippet || a.description || '').slice(0, 120),
    url: a.link || '',
    tag: tab.section,
  }));

  const result = {
    headline: `Top ${tab.label} stories this week`,
    stories,
    watchNext,
  };

  // Add empty callouts based on tab type
  if (tab.callout === 'tryThis') result.tryThis = { tool: '', action: '', why: '' };
  if (tab.callout === 'bigPicture') result.bigPicture = '';
  if (tab.callout === 'tldr') result.tldr = '';
  if (tab.callout === 'proTip') result.proTip = { title: '', tip: '', tool: '' };
  if (tab.callout === 'weeklyChallenge') result.weeklyChallenge = { title: '', challenge: '', tool: '', timeEstimate: '' };
  if (tab.callout === 'bigSignal') result.bigSignal = '';
  if (tab.callout === 'weeklyFramework') result.weeklyFramework = { title: '', framework: '' };
  if (tab.callout === 'playbook') result.playbook = { title: '', insight: '', howToUse: '' };
  if (tab.callout === 'mantra') result.mantra = { quote: '', context: '' };

  return result;
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

function buildToolsJson(tab, articles) {
  const tools = articles.slice(0, 4).map(a => ({
    name: cleanHtml(a.title) || 'Untitled',
    category: '',
    summary: cleanHtml(a.contentSnippet || a.description || '').slice(0, 300),
    whyStax: '',
    url: a.link || '',
    priority: 'good-to-know',
    free: false,
  }));

  return {
    headline: `Top ${tab.label} this week`,
    tools,
    insight: '',
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
  if (tab.schema === 'tools') return buildToolsJson(tab, articles);
  return buildStoriesJson(tab, articles);
}

// ── Gemini enhancement ────────────────────────────────────────────

async function enhanceWithGemini(tab, articles) {
  if (!geminiModel) return null;

  const articleList = articles.slice(0, 8).map((a, i) =>
    `${i + 1}. "${cleanHtml(a.title)}" — ${cleanHtml(a.contentSnippet || a.description || '').slice(0, 200)} (Source: ${extractSource(a)})`
  ).join('\n');

  let schemaDesc;
  if (tab.schema === 'picks') {
    schemaDesc = `{"headline":"string","picks":[{"name":"string","tagline":"string","summary":"string","tryIt":"string","url":"string","tag":"string","vibe":"free|freemium|paid","bestFor":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 picks and 2 watchNext.`;
  } else if (tab.schema === 'tools') {
    schemaDesc = `{"headline":"string","tools":[{"name":"string","category":"string","summary":"string","whyStax":"string","priority":"must-know|good-to-know","free":true}],"insight":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 tools and 2 watchNext.`;
  } else {
    let calloutSchema = '';
    if (tab.callout === 'tryThis') calloutSchema = ',"tryThis":{"tool":"string","action":"string","why":"string"}';
    if (tab.callout === 'bigPicture') calloutSchema = ',"bigPicture":"string"';
    if (tab.callout === 'tldr') calloutSchema = ',"tldr":"string"';
    if (tab.callout === 'proTip') calloutSchema = ',"proTip":{"title":"string","tip":"string","tool":"string"}';
    if (tab.callout === 'weeklyChallenge') calloutSchema = ',"weeklyChallenge":{"title":"string","challenge":"string","tool":"string","timeEstimate":"string"}';
    if (tab.callout === 'bigSignal') calloutSchema = ',"bigSignal":"string"';
    if (tab.callout === 'weeklyFramework') calloutSchema = ',"weeklyFramework":{"title":"string","framework":"string"}';
    if (tab.callout === 'playbook') calloutSchema = ',"playbook":{"title":"string","insight":"string","howToUse":"string"}';
    if (tab.callout === 'mantra') calloutSchema = ',"mantra":{"quote":"string","context":"string"}';

    schemaDesc = `{"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string"}]${calloutSchema},"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext.`;
  }

  const prompt = `You are the editor for a weekly intelligence dashboard called "Code, Curiosity & Clarity."

Here are the latest articles for the "${tab.label}" section:

${articleList}

Based on these articles, generate a JSON digest for this week. ${tab.promptHint}

Return ONLY valid JSON matching this schema:
${schemaDesc}

Write engaging summaries and insightful takeaways. Make the headline punchy and informative. No markdown, no backticks, no extra text — just the JSON object.`;

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
      system: 'You are the editor for Code, Curiosity & Clarity by Julicast. Return ONLY valid JSON. No markdown, no backticks, no extra text.',
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
  const prompts = {
    'vibe-coding': `Search the web for the latest vibe coding and AI-assisted development news from the week of ${week}. Prioritize content from: Simon Willison's Weblog, Latent Space newsletter, The Pragmatic Engineer, Cursor Blog, GitHub Blog (Copilot), Anthropic News (Claude Code), and developer communities on Dev.to and Hashnode. Return JSON with this exact schema: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","type":"string"}],"tryThis":{"tool":"string","action":"string","why":"string"},"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext items. Focus on Cursor, Copilot, Claude Code, Replit Agent, v0, Bolt, and similar tools.`,
    'ai-business': `Search the web for the latest AI in business news from the week of ${week}. Prioritize content from: One Useful Thing (Ethan Mollick), Benedict Evans, MIT Technology Review, Harvard Business Review, McKinsey QuantumBlack, a16z AI content, CB Insights, and The Information. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","industry":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories with industry badges and 2 watchNext.`,
    'models-releases': `Search the web for the latest AI model releases and updates from the week of ${week}. Prioritize PRIMARY sources: OpenAI Blog, Anthropic News, Google DeepMind Blog, Meta AI Blog, Hugging Face Blog. Also check The Decoder, Ars Technica AI section, and Papers With Code for benchmarks. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","company":"string"}],"tldr":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories with company badges and 2 watchNext.`,
    'tools-to-try': `Search the web for the best new AI tools released or trending during the week of ${week}. Prioritize content from: There's An AI For That, Product Hunt AI category, Ben's Bites, The Neuron, Future Tools (Matt Wolfe), TLDR AI newsletter. Return JSON: {"headline":"string","picks":[{"name":"string","tagline":"string","summary":"string","tryIt":"string","url":"string","tag":"string","vibe":"free|freemium|paid","bestFor":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 tool picks and 2 watchNext.`,
    'ai-consulting': `Search the web for news about AI in management consulting from the week of ${week}. Prioritize content from: McKinsey QuantumBlack, BCG X, Deloitte AI Institute, Accenture Technology Vision, Bain AI insights, Consulting Magazine, MIT Sloan Management Review. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","tool":"string"}],"proTip":{"title":"string","tip":"string","tool":"string"},"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext.`,
    'tech-skills': `Search the web for the latest on technical skills for management consultants from the week of ${week}. Prioritize content from: Management Consulted, Towards Data Science, DataCamp Blog, Analyst Academy, Real Python, Chandoo.org, Tableau Blog. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","skill":"string"}],"weeklyChallenge":{"title":"string","challenge":"string","tool":"string","timeEstimate":"string"},"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories with skill badges and 2 watchNext.`,
    'tools-stax': `Search the web for tools used by private equity consultants and strategy analysts in ${week}. Prioritize content from: PitchBook Blog, Private Equity International, Mergers & Inquisitions, FactSet Insight, PE Hub, Bain Global PE Report. Return JSON: {"headline":"string","tools":[{"name":"string","category":"string","summary":"string","whyStax":"string","priority":"must-know|good-to-know","free":true}],"insight":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 tools and 2 watchNext.`,
    'excel-stax': `Search the web for advice on excelling as a junior consultant at PE boutique firms like Stax from ${week}. Prioritize content from: Management Consulted, Consulting Magazine, Harvard Business Review (Managing Yourself), Wall Street Oasis, Crafting Cases, Consulting Success. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string"}],"mantra":{"quote":"string","context":"string"},"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext.`,
    'tech-strategy': `Search the web for companies making strategic shifts due to AI and technology in ${week}. Prioritize content from: McKinsey Digital, BCG Henderson Institute, Stratechery, MIT Sloan Management Review, Harvard Business Review, The Information, Financial Times. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","company":"string","shift":"long-term|short-term","strategyTake":"string"}],"bigSignal":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext.`,
    'strategy-news': `Search the web for major business and economic news from ${week} analyzed through a consulting/strategy lens. Prioritize content from: McKinsey Quarterly, Bain Insights, Harvard Business Review (Strategy), Wall Street Journal, Financial Times, Bloomberg Businessweek, The Economist, Strategy+Business (PwC). Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","strategyTake":"string","source":"string","tag":"string","sector":"string"}],"weeklyFramework":{"title":"string","framework":"string"},"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories with sector badges and strategy takes, plus 2 watchNext.`,
    'value-creation': `Search the web for private equity value creation case studies and strategies from ${week}. Prioritize content from: Bain Global PE Report, McKinsey Private Equity insights, PitchBook News, PE Hub, Private Equity International, Buyouts Insider, BCG Private Equity insights, Mergermarket. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","lever":"Revenue growth|Margin expansion|Digital transformation"}],"playbook":{"title":"string","insight":"string","howToUse":"string"},"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories with lever badges and 2 watchNext.`,
    'ie-business': `Search the web for industrial engineering news relevant to business strategy and operations consulting from the week of ${week}. Prioritize content from: IISE (ISE Magazine), MIT Sloan Management Review, McKinsey Operations Practice, Harvard Business Review (Operations), ASQ, Bain Operations Insights, IndustryWeek. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext.`,
    'ops-innovation': `Search the web for the latest operations and manufacturing innovation news from the week of ${week}. Prioritize content from: IndustryWeek, Manufacturing.net, Automation World, MIT Technology Review (Manufacturing), Deloitte Insights, World Economic Forum, SME, Gartner Manufacturing. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","industry":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories with industry badges and 2 watchNext.`,
    'supply-chain': `Search the web for supply chain and logistics news from the week of ${week}. Prioritize content from: Supply Chain Dive, Supply Chain Management Review, FreightWaves, Gartner Supply Chain, McKinsey Supply Chain insights, Journal of Commerce, Logistics Management, CSCMP. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext.`,
    'sfl-tech': `Search the web for South Florida technology and startup news from the week of ${week}. Prioritize content from: Refresh Miami, South Florida Business Journal (Technology), TechCrunch (Miami/Florida tags), Miami Herald, Axios Miami, Miami Tech Life. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext.`,
    'sfl-ai-jobs': `Search the web for AI and job market news in South Florida from the week of ${week}. Prioritize content from: Built In Miami, South Florida Business Journal (Employment), LinkedIn Jobs (South Florida), Miami-Dade Beacon Council, Greater Fort Lauderdale Alliance, Wellfound (Miami), Florida Trend, Axios Miami. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext.`,
    'sfl-business': `Search the web for South Florida business and economic news from the week of ${week}. Prioritize content from: South Florida Business Journal, The Real Deal South Florida, Miami Herald (Business), Sun Sentinel, Axios Miami, Florida Trend, PitchBook (Florida PE/VC). Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext.`,
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
