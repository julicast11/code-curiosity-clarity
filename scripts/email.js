/**
 * Weekly email digest for Code, Curiosity & Clarity.
 *
 * Reads generated JSON files from public/data/ and sends an HTML email
 * digest via Gmail SMTP using nodemailer.
 *
 * Usage:
 *   GMAIL_USER=you@gmail.com \
 *   GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx \
 *   RECIPIENT_EMAIL=recipient@gmail.com \
 *   node scripts/email.js
 *
 * Requires a Gmail App Password (not your regular password).
 * Generate one at: https://myaccount.google.com/apppasswords
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createTransport } from 'nodemailer';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'public', 'data');

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !RECIPIENT_EMAIL) {
  console.error('Error: GMAIL_USER, GMAIL_APP_PASSWORD, and RECIPIENT_EMAIL environment variables are required.');
  process.exit(1);
}

// ── Section & tab definitions ─────────────────────────────────────

const SECTIONS = [
  {
    title: 'AI',
    color: '#C8974A',
    emoji: '⚡',
    tabs: [
      { id: 'tools-to-try', label: 'Tools to Try', emoji: '🛠' },
      { id: 'ai-business', label: 'AI in Business', emoji: '💼' },
      { id: 'models-releases', label: 'Models & Releases', emoji: '🧠' },
      { id: 'vibe-coding', label: 'Vibe Coding', emoji: '🎨' },
    ],
  },
  {
    title: 'Consulting',
    color: '#9E7AC0',
    emoji: '🏛',
    tabs: [
      { id: 'skills-tools', label: 'Skills & Tools', emoji: '🧰' },
      { id: 'ai-consulting', label: 'AI in Consulting', emoji: '🤖' },
      { id: 'life-at-stax', label: 'Life at Stax', emoji: '🏢' },
    ],
  },
  {
    title: 'Strategy',
    color: '#6EB0A0',
    emoji: '♟',
    tabs: [
      { id: 'tech-strategy', label: 'Tech Strategy Shifts', emoji: '🔄' },
      { id: 'value-creation', label: 'Value Creation', emoji: '📈' },
    ],
  },
  {
    title: 'Industrial & Ops',
    color: '#B86858',
    emoji: '⚙️',
    tabs: [
      { id: 'ie-business', label: 'IE Meets Business', emoji: '📊' },
      { id: 'ops-innovation', label: 'Operations & Innovation', emoji: '🏭' },
      { id: 'supply-chain', label: 'Supply Chain', emoji: '🚚' },
    ],
  },
  {
    title: 'South Florida',
    color: '#48A068',
    emoji: '🌴',
    tabs: [
      { id: 'sfl-tech', label: 'Tech & Startups', emoji: '🚀' },
      { id: 'sfl-ai-jobs', label: 'AI & Jobs', emoji: '💼' },
      { id: 'sfl-business', label: 'Business & Economy', emoji: '🏙️' },
    ],
  },
];

// ── HTML builders ─────────────────────────────────────────────────

function readTabData(tabId) {
  const filePath = join(DATA_DIR, `${tabId}.json`);
  if (!existsSync(filePath)) return null;
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildStoryHtml(story, color) {
  const tag = story.tag ? `<span style="display:inline-block;background:${color}20;color:${color};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;margin-bottom:6px;">${escapeHtml(story.tag)}</span>` : '';
  const badge = story.industry || story.company || story.skill || story.sector || story.lever || story.tool || '';
  const badgeHtml = badge ? `<span style="display:inline-block;background:#2A2825;color:#A09888;padding:2px 6px;border-radius:3px;font-size:10px;margin-left:6px;">${escapeHtml(badge)}</span>` : '';

  return `
    <div style="background:#1A1918;border-radius:10px;padding:16px;margin-bottom:12px;border-left:3px solid ${color};">
      <div>${tag}${badgeHtml}</div>
      <div style="font-family:'Georgia',serif;font-size:15px;font-weight:600;color:#F0EBE0;margin:6px 0;">${escapeHtml(story.title)}</div>
      <div style="font-size:13px;color:#A09888;line-height:1.5;margin:6px 0;">${escapeHtml(story.summary)}</div>
      <div style="font-size:12px;color:${color};margin-top:8px;">
        <strong>Takeaway:</strong> ${escapeHtml(story.takeaway || story.strategyTake || '')}
      </div>
      ${story.source ? `<div style="font-size:11px;color:#6A6560;margin-top:4px;">Source: ${escapeHtml(story.source)}</div>` : ''}
    </div>`;
}

function buildToolPickHtml(pick, color) {
  const vibeColor = pick.vibe === 'free' ? '#48A870' : pick.vibe === 'freemium' ? '#E8A030' : '#C86880';
  return `
    <div style="background:#1A1918;border-radius:10px;padding:16px;margin-bottom:12px;border-left:3px solid ${color};">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-family:'Georgia',serif;font-size:15px;font-weight:600;color:#F0EBE0;">${escapeHtml(pick.name)}</span>
        <span style="background:${vibeColor}20;color:${vibeColor};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;text-transform:uppercase;">${escapeHtml(pick.vibe || 'tool')}</span>
      </div>
      <div style="font-size:12px;color:${color};font-style:italic;margin:4px 0;">${escapeHtml(pick.tagline || '')}</div>
      <div style="font-size:13px;color:#A09888;line-height:1.5;margin:6px 0;">${escapeHtml(pick.summary)}</div>
      ${pick.bestFor ? `<div style="font-size:12px;color:#6A6560;margin-top:4px;">Best for: ${escapeHtml(pick.bestFor)}</div>` : ''}
    </div>`;
}

function buildToolItemHtml(tool, color) {
  const priorityColor = tool.priority === 'must-know' ? '#C86880' : '#48A870';
  return `
    <div style="background:#1A1918;border-radius:10px;padding:16px;margin-bottom:12px;border-left:3px solid ${color};">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="font-family:'Georgia',serif;font-size:15px;font-weight:600;color:#F0EBE0;">${escapeHtml(tool.name)}</span>
        <span style="background:${priorityColor}20;color:${priorityColor};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;">${escapeHtml(tool.priority || '')}</span>
      </div>
      ${tool.category ? `<div style="font-size:11px;color:#6A6560;margin:4px 0;">${escapeHtml(tool.category)}</div>` : ''}
      <div style="font-size:13px;color:#A09888;line-height:1.5;margin:6px 0;">${escapeHtml(tool.summary)}</div>
      ${tool.whyStax ? `<div style="font-size:12px;color:${color};margin-top:4px;"><strong>Why Stax:</strong> ${escapeHtml(tool.whyStax)}</div>` : ''}
    </div>`;
}

function buildWatchNextHtml(items, color) {
  if (!items || items.length === 0) return '';
  const itemsHtml = items.map(item => `
    <div style="padding:8px 0;border-bottom:1px solid #2A2825;">
      <div style="font-size:13px;font-weight:600;color:#F0EBE0;">${escapeHtml(item.title)}</div>
      <div style="font-size:12px;color:#A09888;margin-top:2px;">${escapeHtml(item.why)}</div>
    </div>
  `).join('');

  return `
    <div style="background:#1A1918;border-radius:10px;padding:16px;margin-top:16px;">
      <div style="font-size:12px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">👀 Watch Next</div>
      ${itemsHtml}
    </div>`;
}

function buildTabContentHtml(tabId, data, color) {
  if (!data) return '<div style="color:#6A6560;font-size:13px;padding:12px;">No data available for this tab.</div>';

  let html = '';

  // Headline
  if (data.headline) {
    html += `<div style="font-family:'Georgia',serif;font-size:18px;color:#F0EBE0;padding:12px 0;border-bottom:1px solid ${color}40;margin-bottom:16px;">${escapeHtml(data.headline)}</div>`;
  }

  // Stories
  if (data.stories) {
    html += data.stories.map(s => buildStoryHtml(s, color)).join('');
  }

  // Tool picks (tools-to-try)
  if (data.picks) {
    html += data.picks.map(p => buildToolPickHtml(p, color)).join('');
  }

  // Tool items (tools-stax)
  if (data.tools) {
    html += data.tools.map(t => buildToolItemHtml(t, color)).join('');
  }

  // Watch Next
  html += buildWatchNextHtml(data.watchNext, color);

  return html;
}

// ── Build full email HTML ─────────────────────────────────────────

function buildEmailHtml(weekRange) {
  let sectionsHtml = '';

  for (const section of SECTIONS) {
    let tabsHtml = '';

    for (const tab of section.tabs) {
      const data = readTabData(tab.id);
      const tabContent = buildTabContentHtml(tab.id, data, section.color);

      tabsHtml += `
        <div style="margin-bottom:24px;">
          <div style="font-size:14px;font-weight:700;color:${section.color};margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid ${section.color}40;">
            ${tab.emoji} ${escapeHtml(tab.label)}
          </div>
          ${tabContent}
        </div>`;
    }

    sectionsHtml += `
      <div style="margin-bottom:40px;">
        <div style="font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#F0EBE0;padding:16px 0 8px;border-bottom:2px solid ${section.color};margin-bottom:20px;">
          ${section.emoji} ${escapeHtml(section.title)}
        </div>
        ${tabsHtml}
      </div>`;
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code, Curiosity & Clarity — Weekly Digest</title>
</head>
<body style="margin:0;padding:0;background:#0D0C0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">

    <!-- Header / Logo -->
    <div style="text-align:center;padding:40px 24px 32px;background:#141310;border-radius:16px;border:1px solid #2A2825;">
      <div style="font-size:11px;font-weight:700;color:#C8974A;letter-spacing:4px;text-transform:uppercase;margin-bottom:12px;">Weekly Intelligence Digest</div>
      <div style="height:1px;width:60px;background:#C8974A;margin:0 auto 16px;"></div>
      <div style="font-family:'Georgia',serif;font-size:32px;font-weight:700;color:#F0EBE0;line-height:1.2;margin-bottom:4px;">
        Code, Curiosity <span style="color:#C8974A;">&amp;</span> Clarity
      </div>
      <div style="font-size:12px;color:#6A6560;letter-spacing:3px;text-transform:uppercase;margin-top:8px;">
        by Juliana Castro
      </div>
      <div style="height:1px;width:60px;background:#C8974A;margin:16px auto 0;"></div>
      <div style="font-size:13px;color:#A09888;margin-top:14px;">
        ${escapeHtml(weekRange)}
      </div>
    </div>

    <div style="height:24px;"></div>

    <!-- Content -->
    ${sectionsHtml}

    <!-- Footer -->
    <div style="height:1px;background:linear-gradient(to right,transparent,#C8974A,transparent);margin:32px 0 16px;"></div>
    <div style="text-align:center;padding:16px 0 32px;">
      <div style="font-size:12px;color:#6A6560;">
        Generated automatically every Monday by Code, Curiosity & Clarity
      </div>
      <div style="font-size:11px;color:#4A4540;margin-top:4px;">
        Powered by Claude AI with web search
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Send email ────────────────────────────────────────────────────

async function main() {
  // Read metadata for week range
  const metaPath = join(DATA_DIR, '_meta.json');
  let weekRange = 'This Week';
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
      weekRange = meta.weekRange || weekRange;
    } catch {
      // use default
    }
  }

  console.log(`Building email digest for week of ${weekRange}...`);

  const html = buildEmailHtml(weekRange);

  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Code, Curiosity & Clarity" <${GMAIL_USER}>`,
    to: RECIPIENT_EMAIL,
    subject: `⚡ Weekly Intel Digest — ${weekRange}`,
    html,
  };

  console.log(`Sending to ${RECIPIENT_EMAIL}...`);

  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent successfully! Message ID: ${info.messageId}`);
}

main().catch((err) => {
  console.error('Fatal error sending email:', err);
  process.exit(1);
});
