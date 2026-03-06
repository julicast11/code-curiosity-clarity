import { getLastWeekRange } from './dates';

const week = () => getLastWeekRange();

const TONE = `TONE IS EVERYTHING. Write like a 23-year-old who's lowkey obsessed with this stuff. Casual, direct, zero corporate speak. Use words like "lowkey", "fr", "tbh", "honestly", "literally" naturally — don't force them into every sentence. Short punchy sentences. Emoji where it fits 🔥 but don't overdo it. Think: "Ok tbh this one's actually insane", "Lowkey the most useful thing I've seen all week", "Honestly you need this fr", "This is literally changing the game rn". Summaries MUST be 1-2 sentences MAX. No paragraph blocks. NEVER use words like "leverage", "synergize", "optimize", "streamline", "ecosystem", "utilize", "innovative", "cutting-edge". If I can't skim a whole tab in 15 seconds, it's too long. If a story comes from a podcast (not a website), format the source field as "🎙️ Podcast Name".`;

export const AI_TABS = [
  {
    id: 'tools-to-try',
    label: 'Tools to Try',
    color: '#48A870',
    emoji: '🛠',
    desc: 'The best new AI tools worth your time',
    prompt: () => `Search the web for the best new AI tools released or trending during the week of ${week()}. Prioritize content from: There's An AI For That, Product Hunt AI category, Ben's Bites, The Neuron, Future Tools (Matt Wolfe), TLDR AI newsletter, and Superhuman AI newsletter. Return JSON: {"headline":"string","picks":[{"name":"string","tagline":"string","summary":"string","tryIt":"string","url":"string","tag":"string","vibe":"free|freemium|paid","bestFor":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 tool picks and 2 watchNext. ${TONE}`,
  },
  {
    id: 'ai-business',
    label: 'AI in Business',
    color: '#5BA0D8',
    emoji: '💼',
    desc: 'How enterprises are deploying AI this week',
    prompt: () => `Search the web for the latest AI in business news from the week of ${week()}. Prioritize content from: One Useful Thing (Ethan Mollick), Benedict Evans, MIT Technology Review, Harvard Business Review, McKinsey QuantumBlack, a16z AI content, CB Insights, and The Information. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","industry":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories with industry badges and 2 watchNext. Focus on enterprise AI adoption, ROI cases, and industry transformation. ${TONE}`,
  },
  {
    id: 'models-releases',
    label: 'Models & Releases',
    color: '#9878D0',
    emoji: '🧠',
    desc: 'New models, benchmarks, and capability updates',
    prompt: () => `Search the web for the latest AI model releases and updates from the week of ${week()}. Prioritize PRIMARY sources: OpenAI Blog, Anthropic News, Google DeepMind Blog, Meta AI Blog, Hugging Face Blog. Also check The Decoder, Ars Technica AI section, and Papers With Code for benchmarks. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","company":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories with company badges and 2 watchNext. Cover OpenAI, Anthropic, Google, Meta, Mistral, etc. ${TONE}`,
  },
  {
    id: 'vibe-coding',
    label: 'Vibe Coding',
    color: '#E8A030',
    emoji: '🎨',
    desc: 'Creative coding, AI-assisted dev, and weekend project fuel',
    prompt: () => `Search the web for the latest vibe coding and AI-assisted development news from the week of ${week()}. Prioritize content from: Simon Willison's Weblog, Latent Space newsletter, The Pragmatic Engineer, Cursor Blog, GitHub Blog (Copilot), Anthropic News (Claude Code), and developer communities on Dev.to and Hashnode. Return JSON with this exact schema: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","type":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext items. Focus on Cursor, Copilot, Claude Code, Replit Agent, v0, Bolt, and similar tools. ${TONE}`,
  },
];

export const CONSULTING_TABS = [
  {
    id: 'skills-tools',
    label: 'Skills & Tools',
    color: '#9E7AC0',
    emoji: '🧰',
    desc: 'One skill, one Excel tip, one useful tool — every week',
    prompt: () => `Search the web for the best skill to learn, Excel/data tip, and useful tool for management consultants from the week of ${week()}. Focus on US-based sources. Prioritize content from: Real Python, Chandoo.org, Wall Street Prep, ExcelJet, Management Consulted, Towards Data Science, and DataCamp Blog. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","skill":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include EXACTLY 3 stories: one about a skill to learn (Python, SQL, Tableau, etc.), one Excel or data tip, and one useful tool or shortcut. Include 2 watchNext. Only US-focused content. ${TONE}`,
  },
  {
    id: 'ai-consulting',
    label: 'AI in Consulting',
    color: '#C86880',
    emoji: '🤖',
    desc: 'How AI is changing consulting right now',
    prompt: () => `Search the web for news about AI in management consulting from the week of ${week()}. Focus on US-based sources and content. Prioritize content from: McKinsey QuantumBlack, BCG X, Deloitte AI Institute, Accenture Technology Vision, Bain AI insights, Consulting Magazine, and MIT Sloan Management Review. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","tool":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include EXACTLY 3 stories and 2 watchNext. Focus on McKinsey, BCG, Bain, Deloitte, Accenture, and boutique firms using AI. Only include US-focused content. ${TONE}`,
  },
  {
    id: 'life-at-stax',
    label: 'Life at Stax',
    color: '#B898E0',
    emoji: '🏢',
    desc: 'Firm news, PE sector trends, and career advice',
    prompt: () => `Search the web for news relevant to someone working at Stax (a PE-focused management consulting firm) from the week of ${week()}. Focus on US-based sources. Prioritize content from: PitchBook Blog, Private Equity International, Mergers & Inquisitions, Management Consulted, Consulting Magazine, Wall Street Oasis, and Harvard Business Review. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include EXACTLY 3 stories: one about PE/consulting industry news, one about sectors Stax covers (consumer, healthcare, industrials, tech), and one career tip or professional development insight. Include 2 watchNext. Only US-focused content. ${TONE}`,
  },
];

export const STRATEGY_TABS = [
  {
    id: 'tech-strategy',
    label: 'Tech-Driven Strategy Shifts',
    color: '#6EB0A0',
    emoji: '🔄',
    desc: 'Companies changing strategy due to AI and tech',
    prompt: () => `Search the web for companies making strategic shifts due to AI and technology in ${week()}. Prioritize content from: McKinsey Digital, BCG Henderson Institute, Stratechery (Ben Thompson), MIT Sloan Management Review, Harvard Business Review, The Information, and Financial Times Technology section. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","company":"string","shift":"long-term|short-term","strategyTake":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext. Include shift badges and strategy takes for each story. ${TONE}`,
  },
  {
    id: 'value-creation',
    label: 'Value Creation',
    color: '#48B898',
    emoji: '📈',
    desc: 'How PE-backed companies create and capture value',
    prompt: () => `Search the web for private equity value creation case studies and strategies from ${week()}. Prioritize content from: Bain Global PE Report, McKinsey Private Equity insights, PitchBook News, PE Hub, Private Equity International, Buyouts Insider, BCG Private Equity insights, and Mergermarket. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string","lever":"Revenue growth|Margin expansion|Digital transformation"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. You MUST return exactly 4 stories, one from each of these sectors: Consumer, Industrials, Healthcare, Tech. Each story should have its sector badge. Include 2 watchNext items. Do not saturate any single sector. ${TONE}`,
  },
];

export const INDUSTRIAL_TABS = [
  {
    id: 'ie-business',
    label: 'IE Meets Business',
    color: '#B86858',
    emoji: '📊',
    desc: 'Industrial engineering trends shaping business strategy',
    prompt: () => `Search the web for the most impactful industrial engineering news relevant to business strategy and operations consulting from the week of ${week()}. Prioritize content from: IISE (ISE Magazine), MIT Sloan Management Review, McKinsey Operations Practice, Harvard Business Review (Operations), Bain Operations Insights, and IndustryWeek (Leadership section). Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include only 2-3 of the most relevant stories and 2 watchNext. Be highly selective — only include stories that connect to AI adoption, PE value creation, or consulting strategy themes. Less is more. ${TONE}`,
  },
  {
    id: 'ops-innovation',
    label: 'Operations & Innovation',
    color: '#D08068',
    emoji: '🏭',
    desc: 'Smart manufacturing, automation, and ops tech',
    prompt: () => `Search the web for the most impactful operations and manufacturing innovation news from the week of ${week()}. Prioritize content from: IndustryWeek, Manufacturing.net, Automation World, MIT Technology Review (Manufacturing), Deloitte Insights (Smart Manufacturing), and World Economic Forum (Advanced Manufacturing). Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","industry":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include only 2-3 of the most relevant stories with industry badges and 2 watchNext. Be highly selective — only include stories that connect to AI in operations, PE portfolio company optimization, or digital transformation themes. Less is more. ${TONE}`,
  },
  {
    id: 'supply-chain',
    label: 'Supply Chain & Logistics',
    color: '#E89878',
    emoji: '🚚',
    desc: 'Global supply chain shifts and logistics tech',
    prompt: () => `Search the web for the most impactful supply chain and logistics news from the week of ${week()}. Prioritize content from: Supply Chain Dive, Supply Chain Management Review, FreightWaves, Gartner Supply Chain, McKinsey Supply Chain insights, and Journal of Commerce. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include only 2-3 of the most relevant stories and 2 watchNext. Be highly selective — only include stories that connect to AI-driven logistics, PE portfolio company supply chains, or nearshoring/reshoring trends relevant to US businesses. Less is more. ${TONE}`,
  },
];

export const SOUTHFL_TABS = [
  {
    id: 'sfl-tech',
    label: 'Tech & Startups',
    color: '#48A068',
    emoji: '🚀',
    desc: 'South Florida tech scene, startups, and venture activity',
    prompt: () => `Search the web for South Florida technology and startup news from the week of ${week()}. Prioritize content from: Refresh Miami, South Florida Business Journal (Technology), TechCrunch (Miami/Florida tags), Miami Herald (Business/Tech), Axios Miami, Miami Tech Life, and Florida Venture Blog. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext. Focus on Miami tech, Fort Lauderdale startups, South Florida venture capital, tech company relocations to Florida, and the growing tech ecosystem in South Florida. ${TONE}`,
  },
  {
    id: 'sfl-ai-jobs',
    label: 'AI & Jobs',
    color: '#60B880',
    emoji: '💼',
    desc: 'AI adoption and job market in South Florida',
    prompt: () => `Search the web for AI and job market news in South Florida from the week of ${week()}. Prioritize content from: Built In Miami, South Florida Business Journal (Employment), LinkedIn Jobs (South Florida), Miami-Dade Beacon Council, Greater Fort Lauderdale Alliance, Wellfound (Miami), Florida Trend, and Axios Miami. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext. Focus on AI jobs in Miami and South Florida, consulting hiring, tech job openings, companies expanding in South Florida, remote work trends, and the intersection of AI and the local job market. ${TONE}`,
  },
  {
    id: 'sfl-business',
    label: 'Business & Economy',
    color: '#78D0A0',
    emoji: '🏙️',
    desc: 'South Florida business landscape and economic trends',
    prompt: () => `Search the web for South Florida business and economic news from the week of ${week()}. Prioritize content from: South Florida Business Journal, The Real Deal South Florida, Miami Herald (Business), Sun Sentinel (Business), Axios Miami, Florida Trend, PitchBook (Florida PE/VC), and South Florida Business & Wealth. Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string","sector":"string"}],"bigPicture":"string","watchNext":[{"title":"string","why":"string","tag":"string"}]}. Include 4 stories and 2 watchNext. Focus on Miami and South Florida business news, real estate, finance, PE/VC activity in Florida, major corporate moves, and economic development relevant to a young professional in the area. ${TONE}`,
  },
];
