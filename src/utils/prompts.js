import { getLastWeekRange } from './dates';

const week = () => getLastWeekRange();

const TONE = `Write casually like a 23yo texting — use "lowkey", "fr", "tbh", "literally" naturally. 1-2 sentence summaries MAX. No corporate speak. Emoji sparingly.`;

const SCHEMA_STORIES = (n = 4) => `Return JSON: {"headline":"string","stories":[{"title":"string","summary":"string","takeaway":"string","source":"string","tag":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. ${n} stories, 2 watchNext.`;

export const AI_TABS = [
  {
    id: 'tools-to-try',
    label: 'Tools to Try',
    color: '#48A870',
    emoji: '🛠',
    desc: 'The best new AI tools worth your time',
    prompt: () => `Best new AI tools from ${week()}. ${TONE} Return JSON: {"headline":"string","picks":[{"name":"string","tagline":"string","summary":"string","tryIt":"string","url":"string","tag":"string","vibe":"free|freemium|paid","bestFor":"string"}],"watchNext":[{"title":"string","why":"string","tag":"string"}]}. 4 picks, 2 watchNext.`,
  },
  {
    id: 'ai-business',
    label: 'AI in Business',
    color: '#5BA0D8',
    emoji: '💼',
    desc: 'How enterprises are deploying AI this week',
    prompt: () => `Top AI in business news from ${week()}. Enterprise adoption, ROI cases. ${TONE} ${SCHEMA_STORIES(4)}`,
  },
  {
    id: 'models-releases',
    label: 'Models & Releases',
    color: '#9878D0',
    emoji: '🧠',
    desc: 'New models, benchmarks, and capability updates',
    prompt: () => `Latest AI model releases from ${week()}. Cover OpenAI, Anthropic, Google, Meta, Mistral. ${TONE} ${SCHEMA_STORIES(4)}`,
  },
  {
    id: 'vibe-coding',
    label: 'Vibe Coding',
    color: '#E8A030',
    emoji: '🎨',
    desc: 'Creative coding, AI-assisted dev, and weekend project fuel',
    prompt: () => `Latest vibe coding and AI dev tools news from ${week()}. Cursor, Copilot, Claude Code, Replit, v0, Bolt. ${TONE} ${SCHEMA_STORIES(4)}`,
  },
];

export const CONSULTING_TABS = [
  {
    id: 'skills-tools',
    label: 'Skills & Tools',
    color: '#9E7AC0',
    emoji: '🧰',
    desc: 'One skill, one Excel tip, one useful tool — every week',
    prompt: () => `Best consultant skills and tools from ${week()}. 3 stories: one skill (Python/SQL/Tableau), one Excel tip, one useful tool. US only. ${TONE} ${SCHEMA_STORIES(3)}`,
  },
  {
    id: 'ai-consulting',
    label: 'AI in Consulting',
    color: '#C86880',
    emoji: '🤖',
    desc: 'How AI is changing consulting right now',
    prompt: () => `How AI is changing consulting, week of ${week()}. McKinsey, BCG, Bain, Deloitte, Accenture. US only. ${TONE} ${SCHEMA_STORIES(3)}`,
  },
  {
    id: 'life-at-stax',
    label: 'Life at Stax',
    color: '#B898E0',
    emoji: '🏢',
    desc: 'Firm news, PE sector trends, and career advice',
    prompt: () => `News for a PE consulting analyst at Stax, week of ${week()}. 3 stories: one PE/consulting news, one sector trend (consumer/healthcare/industrials/tech), one career tip. US only. ${TONE} ${SCHEMA_STORIES(3)}`,
  },
];

export const STRATEGY_TABS = [
  {
    id: 'tech-strategy',
    label: 'Tech-Driven Strategy Shifts',
    color: '#6EB0A0',
    emoji: '🔄',
    desc: 'Companies changing strategy due to AI and tech',
    prompt: () => `Companies making strategic shifts due to AI/tech, week of ${week()}. ${TONE} ${SCHEMA_STORIES(4)}`,
  },
  {
    id: 'value-creation',
    label: 'Value Creation',
    color: '#48B898',
    emoji: '📈',
    desc: 'How PE-backed companies create and capture value',
    prompt: () => `PE value creation news from ${week()}. Exactly 4 stories — one each from Consumer, Industrials, Healthcare, Tech. ${TONE} ${SCHEMA_STORIES(4)}`,
  },
];

export const INDUSTRIAL_TABS = [
  {
    id: 'ie-business',
    label: 'IE Meets Business',
    color: '#B86858',
    emoji: '📊',
    desc: 'Industrial engineering trends shaping business strategy',
    prompt: () => `Industrial engineering news relevant to consulting/PE from ${week()}. Only 2-3 best stories. ${TONE} ${SCHEMA_STORIES(3)}`,
  },
  {
    id: 'ops-innovation',
    label: 'Operations & Innovation',
    color: '#D08068',
    emoji: '🏭',
    desc: 'Smart manufacturing, automation, and ops tech',
    prompt: () => `Operations and manufacturing innovation news from ${week()}. AI in ops, smart manufacturing. Only 2-3 best. ${TONE} ${SCHEMA_STORIES(3)}`,
  },
  {
    id: 'supply-chain',
    label: 'Supply Chain & Logistics',
    color: '#E89878',
    emoji: '🚚',
    desc: 'Global supply chain shifts and logistics tech',
    prompt: () => `Supply chain and logistics news from ${week()}. AI logistics, nearshoring, US-focused. Only 2-3 best. ${TONE} ${SCHEMA_STORIES(3)}`,
  },
];

export const SOUTHFL_TABS = [
  {
    id: 'sfl-tech',
    label: 'Tech & Startups',
    color: '#48A068',
    emoji: '🚀',
    desc: 'South Florida tech scene, startups, and venture activity',
    prompt: () => `South Florida tech and startup news from ${week()}. Miami, Fort Lauderdale, VC activity. ${TONE} ${SCHEMA_STORIES(4)}`,
  },
  {
    id: 'sfl-ai-jobs',
    label: 'AI & Jobs',
    color: '#60B880',
    emoji: '💼',
    desc: 'AI adoption and job market in South Florida',
    prompt: () => `AI and tech job market news in South Florida from ${week()}. Hiring, new roles, companies expanding. ${TONE} ${SCHEMA_STORIES(4)}`,
  },
  {
    id: 'sfl-business',
    label: 'Business & Economy',
    color: '#78D0A0',
    emoji: '🏙️',
    desc: 'South Florida business landscape and economic trends',
    prompt: () => `South Florida business and economy news from ${week()}. Real estate, finance, PE/VC, corporate moves. ${TONE} ${SCHEMA_STORIES(4)}`,
  },
];
