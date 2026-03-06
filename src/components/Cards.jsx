export function StoryCard({ story, color, index = 0 }) {
  const delay = index * 55;
  return (
    <div
      className="story-card"
      style={{
        animationDelay: `${delay}ms`,
        '--accent': color,
      }}
    >
      <div
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: `linear-gradient(to bottom, ${color}, transparent)`,
        }}
      />
      <div className="story-card-top">
        {story.tag && (
          <span className="tag-pill" style={{ background: `${color}22`, color }}>
            {story.tag}
          </span>
        )}
        {story.industry && <span className="badge">{story.industry}</span>}
        {story.company && <span className="badge">{story.company}</span>}
        {story.skill && <span className="badge">{story.skill}</span>}
        {story.tool && <span className="badge">🛠 {story.tool}</span>}
        {story.lever && <span className="badge">{story.lever}</span>}
        {story.sector && <span className="badge">{story.sector}</span>}
        {story.type && <span className="badge">{story.type}</span>}
        {story.shift && (
          <span className="badge" style={{
            background: story.shift === 'long-term' ? 'rgba(110,176,160,0.12)' : 'rgba(232,176,48,0.12)',
            color: story.shift === 'long-term' ? '#6EB0A0' : '#E8B030',
            border: 'none',
          }}>
            {story.shift}
          </span>
        )}
        {story.source && <span className="story-source">{story.source}</span>}
      </div>
      {story.url ? (
        <a href={story.url} target="_blank" rel="noopener noreferrer" className="story-title story-link">
          {story.title}
        </a>
      ) : (
        <div className="story-title">{story.title}</div>
      )}
      <div className="story-summary">{story.summary}</div>
      {story.strategyTake && (
        <div className="strategy-take-box">
          <div className="strategy-take-label">Strategy Take</div>
          <div className="strategy-take-body">{story.strategyTake}</div>
        </div>
      )}
      {story.takeaway && (
        <div className="story-takeaway" style={{ background: `${color}10` }}>
          {story.takeaway}
        </div>
      )}
    </div>
  );
}

export function ToolCard({ tool, color, index = 0 }) {
  const delay = index * 55;
  const vibeClass = tool.vibe === 'free' ? 'vibe-free' : tool.vibe === 'paid' ? 'vibe-paid' : 'vibe-freemium';
  return (
    <div className="tool-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="tool-card-bar" style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
      <div className="tool-card-header">
        <div>
          {tool.url ? (
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="tool-name tool-link">
              {tool.name}
            </a>
          ) : (
            <div className="tool-name">{tool.name}</div>
          )}
          {(tool.tagline || tool.category) && (
            <div className="tool-tagline" style={{ color }}>{tool.tagline || tool.category}</div>
          )}
        </div>
        <div className="tool-badges">
          {tool.vibe && <span className={`vibe-badge ${vibeClass}`}>{tool.vibe}</span>}
          {tool.free !== undefined && (
            <span className={`vibe-badge ${tool.free ? 'vibe-free' : 'vibe-paid'}`}>
              {tool.free ? 'free' : 'paid'}
            </span>
          )}
          {tool.bestFor && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-faint)' }}>
              {tool.bestFor}
            </span>
          )}
          {tool.priority && (
            <span className="badge" style={{
              background: tool.priority === 'must-know' ? 'rgba(200,151,74,0.15)' : 'rgba(255,255,255,0.04)',
              color: tool.priority === 'must-know' ? 'var(--gold)' : 'var(--text-muted)',
              border: 'none',
            }}>
              {tool.priority}
            </span>
          )}
        </div>
      </div>
      <div className="tool-summary">{tool.summary}</div>
      {(tool.tryIt || tool.whyStax) && (
        <div className="tool-tryit">
          <div className="tool-tryit-label">{tool.whyStax ? 'Why Stax' : 'Try It'}</div>
          <div className="tool-tryit-body">{tool.tryIt || tool.whyStax}</div>
          {tool.url && (
            <a href={tool.url} target="_blank" rel="noopener noreferrer">
              {tool.url} →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export function WatchNext({ items = [], color }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="watch-next">
      <div className="watch-next-header">
        <span className="watch-next-label" style={{ color }}>Watch This Week →</span>
        <hr className="watch-next-hr" style={{ background: color }} />
      </div>
      <div className="watch-grid">
        {items.map((item, i) => (
          <div
            key={i}
            className="watch-card"
            style={{ background: `${color}08` }}
          >
            <span className="watch-icon">👀</span>
            <div>
              {item.url ? (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="watch-title watch-link">
                  {item.title}
                </a>
              ) : (
                <div className="watch-title">{item.title}</div>
              )}
              <div className="watch-why">{item.why}</div>
              {item.tag && (
                <span className="watch-tag" style={{ background: `${color}15`, color }}>
                  {item.tag}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeadlineCallout({ text, color, label = 'This Week' }) {
  if (!text) return null;
  return (
    <div className="headline-callout" style={{ borderLeftColor: color }}>
      <div className="headline-label" style={{ color }}>{label}</div>
      <div className="headline-text">{text}</div>
    </div>
  );
}

export function CalloutBox({ icon, label, sublabel, title, body, footer, color }) {
  return (
    <div className="callout-box">
      <div className="callout-icon-label">
        <span className="callout-icon">{icon}</span>
        <span className="callout-label" style={{ color }}>{label}</span>
        {sublabel && <span className="callout-sublabel">{sublabel}</span>}
      </div>
      {title && <div className="callout-title">{title}</div>}
      {body && <div className="callout-body">{body}</div>}
      {footer && <div className="callout-footer">{footer}</div>}
    </div>
  );
}

export function DarkBox({ text, label, color }) {
  if (!text) return null;
  return (
    <div className="dark-box">
      {label && <div className="dark-box-label" style={{ color }}>{label}</div>}
      <div className="dark-box-text">{text}</div>
    </div>
  );
}

export function MantraBox({ quote, context }) {
  if (!quote) return null;
  return (
    <div className="mantra-box">
      <div className="mantra-quote">"{quote}"</div>
      {context && <div className="mantra-context">{context}</div>}
    </div>
  );
}

export function PlaybookBox({ title, insight, howToUse, color }) {
  if (!title) return null;
  return (
    <div className="playbook-box" style={{ background: `${color}08` }}>
      <div className="playbook-title">{title}</div>
      {insight && <div className="playbook-insight">{insight}</div>}
      {howToUse && (
        <>
          <div className="playbook-howto-label">How to Use</div>
          <div className="playbook-howto">{howToUse}</div>
        </>
      )}
    </div>
  );
}
