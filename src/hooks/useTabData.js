import { useState, useRef, useCallback } from 'react';
import { fetchTabData } from '../utils/api';

export function useTabData() {
  const cache = useRef({});
  const [loading, setLoading] = useState({});
  const [data, setData] = useState({});
  const [errors, setErrors] = useState({});

  const loadTab = useCallback(async (tabId, prompt, apiKey, force = false) => {
    if (!force && cache.current[tabId]) {
      setData((prev) => ({ ...prev, [tabId]: cache.current[tabId] }));
      return;
    }

    setLoading((prev) => ({ ...prev, [tabId]: true }));
    setErrors((prev) => ({ ...prev, [tabId]: null }));

    try {
      if (!apiKey) {
        throw new Error('No API key configured. Set VITE_ANTHROPIC_KEY in Vercel or add your key via the settings gear.');
      }

      const result = await fetchTabData(prompt, apiKey);
      cache.current[tabId] = result;
      setData((prev) => ({ ...prev, [tabId]: result }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [tabId]: err.message }));
    } finally {
      setLoading((prev) => ({ ...prev, [tabId]: false }));
    }
  }, []);

  const isLoaded = useCallback((tabId) => !!cache.current[tabId], []);

  return { data, loading, errors, loadTab, isLoaded };
}
