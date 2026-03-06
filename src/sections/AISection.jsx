import { useState, useEffect } from 'react';
import TabbedSection from '../components/TabbedSection';
import { StoryCard, ToolCard, WatchNext, HeadlineCallout, CalloutBox, DarkBox } from '../components/Cards';
import { AI_TABS } from '../utils/prompts';
import { useTabData } from '../hooks/useTabData';

export default function AISection({ apiKey }) {
  const [activeTab, setActiveTab] = useState(AI_TABS[0].id);
  const { data, loading, errors, loadTab, isLoaded } = useTabData();

  const currentTab = AI_TABS.find((t) => t.id === activeTab);

  // Auto-load: tries static JSON first, falls back to API if key exists
  useEffect(() => {
    if (!isLoaded(activeTab) && !loading[activeTab]) {
      const tab = AI_TABS.find((t) => t.id === activeTab);
      loadTab(activeTab, tab.prompt(), apiKey);
    }
  }, [activeTab, apiKey]);

  // Manual refresh always hits the live API
  const handleRefresh = (tabId) => {
    const tab = AI_TABS.find((t) => t.id === tabId);
    loadTab(tabId, tab.prompt(), apiKey, true);
  };

  const d = data[activeTab];
  const err = errors[activeTab];
  const isLoading = loading[activeTab];

  return (
    <TabbedSection
      sectionLabel="AI"
      sectionColor="#C8974A"
      tabs={AI_TABS}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      loading={loading}
      isLoaded={isLoaded}
      onRefresh={handleRefresh}
    >
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner" />
          <div className="loading-text">Searching the web for this week's intel...</div>
        </div>
      )}

      {err && (
        <div className="error-box">
          <div className="error-title">Error loading data</div>
          <div className="error-msg">{err}</div>
        </div>
      )}

      {d && !isLoading && (
        <>
          <HeadlineCallout text={d.headline} color={currentTab.color} />

          {/* Stories / Picks grid */}
          <div className="cards-grid">
            {(d.stories || d.picks || []).map((item, i) =>
              d.picks ? (
                <ToolCard key={i} tool={item} color={currentTab.color} index={i} />
              ) : (
                <StoryCard key={i} story={item} color={currentTab.color} index={i} />
              )
            )}
          </div>

          {/* Tab-specific callouts */}
          {activeTab === 'vibe-coding' && d.tryThis && (
            <CalloutBox
              icon="🧪"
              label="Try This Week"
              color={currentTab.color}
              title={d.tryThis.tool}
              body={d.tryThis.action}
              footer={d.tryThis.why}
            />
          )}
          {activeTab === 'ai-business' && d.bigPicture && (
            <DarkBox text={d.bigPicture} label="Big Picture" color={currentTab.color} />
          )}
          {activeTab === 'models-releases' && d.tldr && (
            <div className="callout-box" style={{ background: `${currentTab.color}10` }}>
              <div className="callout-label" style={{ color: currentTab.color }}>TL;DR</div>
              <div className="callout-body" style={{ marginTop: 8 }}>{d.tldr}</div>
            </div>
          )}
          <WatchNext items={d.watchNext} color={currentTab.color} />
        </>
      )}
    </TabbedSection>
  );
}
