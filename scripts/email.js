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
      { id: 'tech-strategy', label: 'Tech-Driven Strategy Shifts', emoji: '🔄' },
      { id: 'value-creation', label: 'Value Creation', emoji: '📈' },
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

function readTimeBadge(minutes) {
  if (!minutes || minutes < 1) return '';
  return `<span style="display:inline-block;background:#2A2825;color:#A09888;padding:1px 6px;border-radius:3px;font-size:10px;margin-left:6px;">⏱ ${minutes} min</span>`;
}

function paywallBadge(paywalled) {
  if (!paywalled) return '';
  return `<span style="display:inline-block;background:#C8688020;color:#C86880;padding:1px 6px;border-radius:3px;font-size:10px;margin-left:6px;">🔒 Paywall</span>`;
}

function cachedBadge(fromCache) {
  if (!fromCache) return '';
  return `<span style="display:inline-block;background:#E8A03020;color:#E8A030;padding:1px 6px;border-radius:3px;font-size:10px;margin-left:6px;">📦 From last week</span>`;
}

function trackUrl(url, section, tab) {
  if (!url) return '';
  try {
    const u = new URL(url);
    u.searchParams.set('utm_source', 'ccc_digest');
    u.searchParams.set('utm_medium', 'email');
    u.searchParams.set('utm_campaign', `weekly_${section.toLowerCase().replace(/\s+/g, '_')}`);
    u.searchParams.set('utm_content', tab);
    return u.toString();
  } catch {
    return url;
  }
}

function buildStoryHtml(story, color, sectionTitle, tabId) {
  const tag = story.tag ? `<span style="display:inline-block;background:${color}20;color:${color};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;margin-bottom:6px;">${escapeHtml(story.tag)}</span>` : '';
  const badge = story.industry || story.company || story.skill || story.sector || story.lever || story.tool || '';
  const badgeHtml = badge ? `<span style="display:inline-block;background:#2A2825;color:#A09888;padding:2px 6px;border-radius:3px;font-size:10px;margin-left:6px;">${escapeHtml(badge)}</span>` : '';
  const trackedUrl = trackUrl(story.url, sectionTitle, tabId);

  return `
    <div style="background:#1A1918;border-radius:10px;padding:16px;margin-bottom:12px;border-left:3px solid ${color};">
      <div>${tag}${badgeHtml}${readTimeBadge(story.readTime)}${paywallBadge(story.paywalled)}</div>
      ${trackedUrl ? `<a href="${escapeHtml(trackedUrl)}" style="font-family:'Georgia',serif;font-size:15px;font-weight:600;color:#F0EBE0;text-decoration:none;display:block;margin:6px 0;">${escapeHtml(story.title)}</a>` : `<div style="font-family:'Georgia',serif;font-size:15px;font-weight:600;color:#F0EBE0;margin:6px 0;">${escapeHtml(story.title)}</div>`}
      <div style="font-size:13px;color:#A09888;line-height:1.5;margin:6px 0;">${escapeHtml(story.summary)}</div>
      <div style="font-size:12px;color:${color};margin-top:8px;">
        <strong>Takeaway:</strong> ${escapeHtml(story.takeaway || story.strategyTake || '')}
      </div>
      ${trackedUrl ? `<a href="${escapeHtml(trackedUrl)}" style="font-size:11px;color:#6A6560;margin-top:4px;text-decoration:none;display:block;">📰 ${escapeHtml(story.source || 'Read article')} →</a>` : story.source ? `<div style="font-size:11px;color:#6A6560;margin-top:4px;">${escapeHtml(story.source)}</div>` : ''}
    </div>`;
}

function buildToolPickHtml(pick, color, sectionTitle, tabId) {
  const vibeColor = pick.vibe === 'free' ? '#48A870' : pick.vibe === 'freemium' ? '#E8A030' : '#C86880';
  const trackedUrl = trackUrl(pick.url, sectionTitle, tabId);
  return `
    <div style="background:#1A1918;border-radius:10px;padding:16px;margin-bottom:12px;border-left:3px solid ${color};">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        ${trackedUrl ? `<a href="${escapeHtml(trackedUrl)}" style="font-family:'Georgia',serif;font-size:15px;font-weight:600;color:#F0EBE0;text-decoration:none;">${escapeHtml(pick.name)}</a>` : `<span style="font-family:'Georgia',serif;font-size:15px;font-weight:600;color:#F0EBE0;">${escapeHtml(pick.name)}</span>`}
        <span style="background:${vibeColor}20;color:${vibeColor};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;text-transform:uppercase;">${escapeHtml(pick.vibe || 'tool')}</span>
      </div>
      <div style="margin-top:4px;">${readTimeBadge(pick.readTime)}${paywallBadge(pick.paywalled)}</div>
      <div style="font-size:12px;color:${color};font-style:italic;margin:4px 0;">${escapeHtml(pick.tagline || '')}</div>
      <div style="font-size:13px;color:#A09888;line-height:1.5;margin:6px 0;">${escapeHtml(pick.summary)}</div>
      ${pick.bestFor ? `<div style="font-size:12px;color:#6A6560;margin-top:4px;">Best for: ${escapeHtml(pick.bestFor)}</div>` : ''}
    </div>`;
}

function buildWatchNextHtml(items, color, sectionTitle, tabId) {
  if (!items || items.length === 0) return '';
  const itemsHtml = items.map(item => {
    const trackedUrl = trackUrl(item.url, sectionTitle, tabId);
    return `
    <div style="padding:8px 0;border-bottom:1px solid #2A2825;">
      ${trackedUrl ? `<a href="${escapeHtml(trackedUrl)}" style="font-size:13px;font-weight:600;color:#F0EBE0;text-decoration:none;">${escapeHtml(item.title)}</a>` : `<div style="font-size:13px;font-weight:600;color:#F0EBE0;">${escapeHtml(item.title)}</div>`}
      <div style="font-size:12px;color:#A09888;margin-top:2px;">${escapeHtml(item.why)}</div>
    </div>`;
  }).join('');

  return `
    <div style="background:#1A1918;border-radius:10px;padding:16px;margin-top:16px;">
      <div style="font-size:12px;font-weight:700;color:${color};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">👀 Watch Next</div>
      ${itemsHtml}
    </div>`;
}

function tabHasContent(data) {
  if (!data) return false;
  const hasStories = data.stories && data.stories.length > 0;
  const hasPicks = data.picks && data.picks.length > 0;
  const hasTools = data.tools && data.tools.length > 0;
  return hasStories || hasPicks || hasTools;
}

function buildTabContentHtml(tabId, data, color, sectionTitle) {
  if (!data || !tabHasContent(data)) return '';

  let html = '';

  // Cached data badge
  if (data._fromCache) {
    html += `<div style="background:#E8A03015;border:1px solid #E8A03040;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:12px;color:#E8A030;">📦 This section is from last week — fresh content wasn't available.</div>`;
  }

  // Headline
  if (data.headline) {
    html += `<div style="font-family:'Georgia',serif;font-size:18px;color:#F0EBE0;padding:12px 0;border-bottom:1px solid ${color}40;margin-bottom:16px;">${escapeHtml(data.headline)}</div>`;
  }

  // Stories
  if (data.stories) {
    html += data.stories.map(s => buildStoryHtml(s, color, sectionTitle, tabId)).join('');
  }

  // Tool picks (tools-to-try)
  if (data.picks) {
    html += data.picks.map(p => buildToolPickHtml(p, color, sectionTitle, tabId)).join('');
  }

  // Watch Next
  html += buildWatchNextHtml(data.watchNext, color, sectionTitle, tabId);

  return html;
}

// ── Highlights section ────────────────────────────────────────────

function buildHighlightsHtml() {
  const filePath = join(DATA_DIR, '_highlights.json');
  if (!existsSync(filePath)) return '';
  let highlights;
  try {
    highlights = JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return '';
  }
  if (!highlights || highlights.length === 0) return '';

  const storiesHtml = highlights.map(h => {
    const trackedUrl = trackUrl(h.url, 'highlights', 'top3');
    return `
    <div style="background:#1A1918;border-radius:10px;padding:14px;margin-bottom:10px;border-left:3px solid #C8974A;">
      <div>
        <span style="display:inline-block;background:#C8974A20;color:#C8974A;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:600;">${escapeHtml(h.tag || '')}</span>
        ${readTimeBadge(h.readTime)}
      </div>
      ${trackedUrl ? `<a href="${escapeHtml(trackedUrl)}" style="font-family:'Georgia',serif;font-size:14px;font-weight:600;color:#F0EBE0;text-decoration:none;display:block;margin:6px 0;">${escapeHtml(h.title)}</a>` : `<div style="font-family:'Georgia',serif;font-size:14px;font-weight:600;color:#F0EBE0;margin:6px 0;">${escapeHtml(h.title)}</div>`}
      <div style="font-size:12px;color:#A09888;line-height:1.4;">${escapeHtml(h.summary)}</div>
    </div>`;
  }).join('');

  return `
    <div style="margin-bottom:32px;">
      <div style="font-family:'Georgia',serif;font-size:20px;font-weight:700;color:#F0EBE0;padding:16px 0 8px;border-bottom:2px solid #C8974A;margin-bottom:16px;">
        🔥 Top 3 This Week
      </div>
      <div style="font-size:12px;color:#6A6560;margin-bottom:14px;">The best stories across all sections — your TL;DR for the week.</div>
      ${storiesHtml}
    </div>`;
}

// ── Table of contents ─────────────────────────────────────────────

function buildTocHtml() {
  const items = SECTIONS.map(s =>
    `<a href="#section-${s.title.toLowerCase().replace(/\s+/g, '-')}" style="color:${s.color};text-decoration:none;font-size:13px;font-weight:600;">${s.emoji} ${escapeHtml(s.title)}</a>`
  ).join('&nbsp;&nbsp;·&nbsp;&nbsp;');

  return `
    <div style="background:#141310;border-radius:10px;padding:14px 18px;margin-bottom:24px;text-align:center;border:1px solid #2A2825;">
      <div style="font-size:10px;font-weight:700;color:#6A6560;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Jump to</div>
      ${items}
    </div>`;
}

// ── Build full email HTML ─────────────────────────────────────────

function buildEmailHtml(weekRange) {
  let sectionsHtml = '';

  for (const section of SECTIONS) {
    let tabsHtml = '';
    let sectionHasContent = false;

    for (const tab of section.tabs) {
      const data = readTabData(tab.id);
      if (!tabHasContent(data)) continue; // Skip empty tabs

      sectionHasContent = true;
      const tabContent = buildTabContentHtml(tab.id, data, section.color, section.title);

      tabsHtml += `
        <div style="margin-bottom:24px;">
          <div style="font-size:14px;font-weight:700;color:${section.color};margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid ${section.color}40;">
            ${tab.emoji} ${escapeHtml(tab.label)}
          </div>
          ${tabContent}
        </div>`;
    }

    if (!sectionHasContent) continue; // Skip entire section if all tabs empty

    const anchor = section.title.toLowerCase().replace(/\s+/g, '-');
    sectionsHtml += `
      <div id="section-${anchor}" style="margin-bottom:40px;">
        <div style="font-family:'Georgia',serif;font-size:22px;font-weight:700;color:#F0EBE0;padding:16px 0 8px;border-bottom:2px solid ${section.color};margin-bottom:20px;">
          ${section.emoji} ${escapeHtml(section.title)}
        </div>
        ${tabsHtml}
      </div>`;
  }

  const highlightsHtml = buildHighlightsHtml();
  const tocHtml = buildTocHtml();

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

    <!-- Table of Contents -->
    ${tocHtml}

    <!-- Highlights -->
    ${highlightsHtml}

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

// ── Error notification email ──────────────────────────────────────

function buildErrorEmailHtml(status) {
  const failedList = (status.failedTabs || []).map(t => `<li style="color:#C86880;">${t}</li>`).join('');
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0D0C0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:640px;margin:0 auto;padding:24px 16px;">
    <div style="background:#1A1918;border-radius:10px;padding:24px;border-left:3px solid #C86880;">
      <div style="font-family:'Georgia',serif;font-size:20px;font-weight:700;color:#F0EBE0;margin-bottom:12px;">
        ⚠️ Weekly Digest — Generation Issue
      </div>
      <div style="font-size:14px;color:#A09888;line-height:1.6;margin-bottom:16px;">
        ${status.fatal
          ? `The content generator crashed: <strong style="color:#C86880;">${escapeHtml(status.error || 'Unknown error')}</strong>`
          : `${status.failedTabs.length} of ${status.totalTabs} tabs failed to generate content.`}
      </div>
      ${failedList ? `<div style="font-size:13px;color:#A09888;"><strong>Failed tabs:</strong><ul>${failedList}</ul></div>` : ''}
      <div style="font-size:12px;color:#6A6560;margin-top:16px;">
        Tabs with cached data from last week were used as fallback. Check the GitHub Actions logs for details.
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ── Send email ────────────────────────────────────────────────────

async function main() {
  const transporter = createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  // Check generation status
  const statusPath = join(DATA_DIR, '_status.json');
  let status = { success: true };
  if (existsSync(statusPath)) {
    try {
      status = JSON.parse(readFileSync(statusPath, 'utf-8'));
    } catch {
      // proceed normally
    }
  }

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

  // If fatal error, send error notification only
  if (status.fatal) {
    console.log('Fatal generation error detected — sending error notification...');
    const errorHtml = buildErrorEmailHtml(status);
    await transporter.sendMail({
      from: `"Code, Curiosity & Clarity" <${GMAIL_USER}>`,
      to: RECIPIENT_EMAIL,
      subject: `⚠️ Weekly Digest Failed — ${weekRange}`,
      html: errorHtml,
    });
    console.log('Error notification sent.');
    return;
  }

  console.log(`Building email digest for week of ${weekRange}...`);

  const html = buildEmailHtml(weekRange);

  const mailOptions = {
    from: `"Code, Curiosity & Clarity" <${GMAIL_USER}>`,
    to: RECIPIENT_EMAIL,
    subject: `⚡ Weekly Intel Digest — ${weekRange}`,
    html,
  };

  console.log(`Sending to ${RECIPIENT_EMAIL}...`);
  const info = await transporter.sendMail(mailOptions);
  console.log(`Email sent successfully! Message ID: ${info.messageId}`);

  // Send a separate warning if some tabs failed
  if (status.failedTabs && status.failedTabs.length > 0) {
    console.log(`Sending warning about ${status.failedTabs.length} failed tab(s)...`);
    const warningHtml = buildErrorEmailHtml(status);
    await transporter.sendMail({
      from: `"Code, Curiosity & Clarity" <${GMAIL_USER}>`,
      to: RECIPIENT_EMAIL,
      subject: `⚠️ Digest Warning: ${status.failedTabs.length} tab(s) failed — ${weekRange}`,
      html: warningHtml,
    });
    console.log('Warning email sent.');
  }
}

main().catch((err) => {
  console.error('Fatal error sending email:', err);
  process.exit(1);
});
