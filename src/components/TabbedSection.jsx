import { useState, useEffect } from 'react';
import { getLastWeekRange } from '../utils/dates';

export default function TabbedSection({
  sectionLabel,
  sectionColor,
  tabs,
  activeTabId,
  onTabChange,
  loading,
  isLoaded,
  onRefresh,
  children,
}) {
  return (
    <div>
      {/* Section header */}
      <div className="section-header-row">
        <span className="section-label" style={{ color: sectionColor }}>{sectionLabel}</span>
        <hr className="section-hr" style={{ background: sectionColor }} />
        <span className="section-date">{getLastWeekRange()}</span>
      </div>

      {/* Tab pills */}
      <div className="tab-pills">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const loaded = isLoaded(tab.id);
          const isLoading = loading[tab.id];
          return (
            <button
              key={tab.id}
              className={`tab-pill ${isActive ? 'active' : ''}`}
              style={isActive ? {
                background: tab.color,
                boxShadow: `0 0 16px ${tab.color}40`,
                borderColor: 'transparent',
              } : {}}
              onClick={() => onTabChange(tab.id)}
            >
              {isLoading ? '⏳' : loaded && !isActive ? (
                <span className="dot" style={{ background: tab.color }} />
              ) : null}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active tab header */}
      {tabs.map((tab) => {
        if (tab.id !== activeTabId) return null;
        return (
          <div key={tab.id} className="tab-header">
            <div>
              <div className="tab-title">{tab.emoji} {tab.label}</div>
              {tab.desc && <div className="tab-desc">{tab.desc}</div>}
            </div>
            <button
              className="refresh-btn"
              onClick={() => onRefresh(tab.id)}
              disabled={loading[tab.id]}
            >
              {loading[tab.id] ? 'Loading...' : '↻ Refresh'}
            </button>
          </div>
        );
      })}

      {/* Content */}
      {children}
    </div>
  );
}
