import { createContext, useContext, useState, useEffect } from 'react';
import { getDefaultEntries, getAllIndicators } from '../data/mockHelpers';

const DataContext = createContext(null);

const STORAGE_KEY = 'pdca_entries';

export function DataProvider({ children }) {
  const indicators = getAllIndicators();

  const [entries, setEntries] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return getDefaultEntries();
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore storage quota
    }
  }, [entries]);

  function updateEntry(updatedEntry) {
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === updatedEntry.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updatedEntry;
        return next;
      }
      return [...prev, updatedEntry];
    });
  }

  function getEntry(month, indicatorId) {
    return entries.find((e) => e.month === month && e.indicatorId === indicatorId) || null;
  }

  function resetToDefaults() {
    const defaults = getDefaultEntries();
    setEntries(defaults);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults));
  }

  return (
    <DataContext.Provider value={{ entries, indicators, updateEntry, getEntry, resetToDefaults }}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useDataContext must be used within DataProvider');
  return ctx;
}
