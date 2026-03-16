import { useState, useRef, useCallback } from 'react';
import { fetchTabData } from '../utils/api';

const BASE = import.meta.env.BASE_URL || '/';

async function loadStaticJson(tabId) {
  const url = `${BASE}data/${tabId}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Static data not found (${res.status})`);
  return res.json();
}

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
      let result;

      // Always try static JSON first (unless manual refresh)
      if (!force) {
        try {
          result = await loadStaticJson(tabId);
        } catch (staticErr) {
          console.warn(`Static load failed for ${tabId}:`, staticErr.message);
        }
      }

      // Only try live API if static failed AND we have an API key
      if (!result && apiKey) {
        result = await fetchTabData(prompt, apiKey);
      }

      if (!result) {
        throw new Error('Data not available yet. Run the weekly workflow to generate content.');
      }

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
