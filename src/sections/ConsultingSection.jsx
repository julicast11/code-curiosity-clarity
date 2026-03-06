import { useState, useEffect } from 'react';
import TabbedSection from '../components/TabbedSection';
import { StoryCard, ToolCard, WatchNext, HeadlineCallout, CalloutBox, DarkBox, MantraBox } from '../components/Cards';
import { CONSULTING_TABS } from '../utils/prompts';
import { useTabData } from '../hooks/useTabData';

export default function ConsultingSection({ apiKey }) {
  const [activeTab, setActiveTab] = useState(CONSULTING_TABS[0].id);
  const { data, loading, errors, loadTab, isLoaded } = useTabData();

  const currentTab = CONSULTING_TABS.find((t) => t.id === activeTab);

  // Auto-load: tries static JSON first, falls back to API if key exists
  useEffect(() => {
    if (!isLoaded(activeTab) && !loading[activeTab]) {
      const tab = CONSULTING_TABS.find((t) => t.id === activeTab);
      loadTab(activeTab, tab.prompt(), apiKey);
    }
  }, [activeTab, apiKey]);

  const handleRefresh = (tabId) => {
    const tab = CONSULTING_TABS.find((t) => t.id === tabId);
    loadTab(tabId, tab.prompt(), apiKey, true);
  };

  const d = data[activeTab];
  const err = errors[activeTab];
  const isLoading = loading[activeTab];

  return (
    <TabbedSection
      sectionLabel="Consulting"
      sectionColor="#9E7AC0"
      tabs={CONSULTING_TABS}
      activeTabId={activeTab}
      onTabChange={setActiveTab}
      loading={loading}
      isLoaded={isLoaded}
      onRefresh={handleRefresh}
    >
      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner" />
          <div className="loading-text">Searching the web for consulting intel...</div>
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
            {(d.stories || d.tools || []).map((item, i) =>
              d.tools ? (
                <ToolCard key={i} tool={item} color={currentTab.color} index={i} />
              ) : (
                <StoryCard key={i} story={item} color={currentTab.color} index={i} />
              )
            )}
          </div>

          {activeTab === 'ai-consulting' && d.proTip && (
            <CalloutBox
              icon="💡"
              label="Pro Tip"
              color={currentTab.color}
              title={d.proTip.title}
              body={d.proTip.tip}
              footer={d.proTip.tool ? `Tool: ${d.proTip.tool}` : ''}
            />
          )}
          {activeTab === 'tech-skills' && d.weeklyChallenge && (
            <CalloutBox
              icon="🏋️"
              label="Weekly Challenge"
              color={currentTab.color}
              title={d.weeklyChallenge.title}
              body={d.weeklyChallenge.challenge}
              footer={`Tool: ${d.weeklyChallenge.tool || ''} · Time: ${d.weeklyChallenge.timeEstimate || ''}`}
            />
          )}
          {activeTab === 'tools-stax' && d.insight && (
            <DarkBox text={d.insight} label="The Consultant's Stack" color={currentTab.color} />
          )}
          {activeTab === 'excel-stax' && d.mantra && (
            <MantraBox quote={d.mantra.quote} context={d.mantra.context} />
          )}

          <WatchNext items={d.watchNext} color={currentTab.color} />
        </>
      )}
    </TabbedSection>
  );
}
