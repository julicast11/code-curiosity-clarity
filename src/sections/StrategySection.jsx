import { useState, useEffect } from 'react';
import TabbedSection from '../components/TabbedSection';
import { StoryCard, WatchNext, HeadlineCallout } from '../components/Cards';
import { STRATEGY_TABS } from '../utils/prompts';
import { useTabData } from '../hooks/useTabData';

export default function StrategySection({ apiKey }) {
  const [activeTab, setActiveTab] = useState(STRATEGY_TABS[0].id);
  const { data, loading, errors, loadTab, isLoaded } = useTabData();

  const currentTab = STRATEGY_TABS.find((t) => t.id === activeTab);

  // Auto-load: tries static JSON first, falls back to API if key exists
  useEffect(() => {
    if (!isLoaded(activeTab) && !loading[activeTab]) {
      const tab = STRATEGY_TABS.find((t) => t.id === activeTab);
      loadTab(activeTab, tab.prompt(), apiKey);
    }
  }, [activeTab, apiKey]);

  const handleRefresh = (tabId) => {
    const tab = STRATEGY_TABS.find((t) => t.id === tabId);
    loadTab(tabId, tab.prompt(), apiKey, true);
  };

  const d = data[activeTab];
  const err = errors[activeTab];
  const isLoading = loading[activeTab];

  return (
    <TabbedSection
      sectionLabel="Strategy"
      sectionColor="#6EB0A0"
      tabs={STRATEGY_TABS}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      loading={loading}
      isLoaded={isLoaded}
      onRefresh={handleRefresh}
    >
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner" />
          <div className="loading-text">Searching the web for strategy intel...</div>
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

          <div className="cards-grid">
            {(d.stories || []).map((item, i) => (
              <StoryCard key={i} story={item} color={currentTab.color} index={i} />
            ))}
          </div>

          <WatchNext items={d.watchNext} color={currentTab.color} />
        </>
      )}
    </TabbedSection>
  );
}
