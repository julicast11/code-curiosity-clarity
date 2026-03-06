import { useState, useCallback } from 'react';
import './App.css';
import SplashScreen from './components/SplashScreen';
import { LogoFull, LogoMark } from './components/Logo';
import { SECTIONS, SOURCES } from './utils/sections';
import { getLastWeekRange } from './utils/dates';
import AISection from './sections/AISection';
import ConsultingSection from './sections/ConsultingSection';
import StrategySection from './sections/StrategySection';
import IndustrialSection from './sections/IndustrialSection';
import SouthFLSection from './sections/SouthFLSection';


function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeSection, setActiveSection] = useState('ai');
  const [apiKey, setApiKey] = useState(() => import.meta.env.VITE_ANTHROPIC_KEY || localStorage.getItem('ccc-api-key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  const handleSplashDone = useCallback(() => setShowSplash(false), []);

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    const key = e.target.elements.key.value.trim();
    if (key) {
      localStorage.setItem('ccc-api-key', key);
      setApiKey(key);
      setShowKeyInput(false);
    }
  };

  if (showSplash) {
    return <SplashScreen onDone={handleSplashDone} />;
  }

  const current = SECTIONS.find((s) => s.id === activeSection);

  const renderSection = () => {
    // Data sections load from static JSON automatically;
    // API key is optional (only needed for manual refresh)
    switch (activeSection) {
      case 'ai':
        return <AISection apiKey={apiKey} />;
      case 'consulting':
        return <ConsultingSection apiKey={apiKey} />;
      case 'strategy':
        return <StrategySection apiKey={apiKey} />;
      case 'industrial':
        return <IndustrialSection apiKey={apiKey} />;
      case 'southfl':
        return <SouthFLSection apiKey={apiKey} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell">
      {/* Top Nav */}
      <nav className="top-nav">
        <LogoFull />
        <div className="nav-pills">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`nav-pill ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
              title={s.label}
              style={activeSection === s.id ? {
                boxShadow: `0 0 12px ${s.color}30`,
              } : {}}
            >
              {s.emoji}
            </button>
          ))}
        </div>
        <div className="nav-week">
          {getLastWeekRange()}
          <button
            onClick={() => setShowKeyInput(!showKeyInput)}
            style={{
              marginLeft: 10,
              background: 'none',
              border: 'none',
              color: 'var(--text-faint)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
            }}
            title="API key settings (optional, for manual refresh)"
          >
            ⚙
          </button>
        </div>
      </nav>

      {/* API Key floating input */}
      {showKeyInput && (
        <div style={{
          position: 'fixed',
          top: 52,
          right: 24,
          zIndex: 200,
          background: '#1a1917',
          border: '1px solid var(--card-border)',
          borderRadius: 10,
          padding: 16,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <form onSubmit={handleApiKeySubmit} style={{ display: 'flex', gap: 8 }}>
            <input
              name="key"
              type="password"
              defaultValue={apiKey}
              placeholder="sk-ant-..."
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--card-border)',
                background: 'var(--card-bg)',
                color: 'var(--text-primary)',
                width: 260,
              }}
            />
            <button
              type="submit"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid var(--gold)',
                background: 'transparent',
                color: 'var(--gold)',
                cursor: 'pointer',
              }}
            >
              Save
            </button>
          </form>
        </div>
      )}

      {/* Body */}
      <div className="app-body">
        {/* Sidebar */}
        <aside className="sidebar">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`sidebar-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
              style={activeSection === s.id ? { borderLeft: `2px solid ${s.color}` } : {}}
            >
              <span className="emoji">{s.emoji}</span>
              {s.label}
            </button>
          ))}

          <div className="sidebar-sources">
            <div className="sidebar-sources-title">Sources</div>
            {SOURCES.map((s) => (
              <div key={s} className="sidebar-source">{s}</div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="main-content">
          <div className="breadcrumb">
            CCC <span className="sep">›</span> {current?.label}
          </div>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

export default App;
