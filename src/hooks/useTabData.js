import { useState, useRef, useCallback } from 'react';
import { fetchTabData } from '../utils/api';

export function useTabData() {
  const cache = useRef({});
  const [loading, setLoading] = useState({});
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});

  // Load from pre-generated static JSON in public/data/
  const loadFromStatic = useCallback(async (tabId) => {
    if (cache.current[tabId]) {
      setData((prev) => ({ ...prev, [tabId]: cache.current[tabId] }));
      return true;
    }

    try {
      const res = await fetch(`/data/${tabId}.json`);
      if (!res.ok) return false;
      const result = await res.json();
      cache.current[tabId] = result;
      setData((prev) => ({ ...prev, [tabId]: result }));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Load a tab: tries static JSON first, falls back to live API
  const loadTab = useCallback(async (tabId, prompt, apiKey, force = false) => {
    if (!force && cache.current[tabId]) {
      setData((prev) => ({ ...prev, [tabId]: cache.current[tabId] }));
      return;
    }

    setLoading((prev) => ({ ...prev, [tabId]: true }));
    setErrors((prev) => ({ ...prev, [tabId]: null }));

    try {
      // If not a forced refresh, try static JSON first
      if (!force) {
        const loaded = await loadFromStatic(tabId);
        if (loaded) {
          setLoading((prev) => ({ ...prev, [tabId]: false }));
          return;
        }
      }

      // Fall back to live API (requires apiKey)
      if (!apiKey) {
        throw new Error('No pre-generated data found. Add your API key to fetch live data, or run "node scripts/generate.js" to generate static content.');
      }

      const result = await fetchTabData(prompt, apiKey);
      cache.current[tabId] = result;
      setData((prev) => ({ ...prev, [tabId]: result }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [tabId]: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, [tabId]: false }));
    }
  }, [loadFromStatic]);

  const isLoaded = useCallback((tabId) => !!cache.current[tabId], []);

  return { data, loading, errors, loadTab, isLoaded };
}
