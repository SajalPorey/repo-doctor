"use client";

import { useEffect, useState, useCallback } from "react";

export interface ScanHistoryEntry {
  owner: string;
  repoName: string;
  score: number;
  language: string;
  repoType: string;
  scannedAt: string; // ISO string
}

const STORAGE_KEY = "repodoctor:history";
const MAX_ENTRIES = 20;

function readHistory(): ScanHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanHistoryEntry[];
  } catch {
    return [];
  }
}

function writeHistory(entries: ScanHistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage not available (e.g. SSR)
  }
}

export function addScanToHistory(entry: Omit<ScanHistoryEntry, "scannedAt">): void {
  const history = readHistory();
  const newEntry: ScanHistoryEntry = { ...entry, scannedAt: new Date().toISOString() };

  // Remove existing entry for same repo (dedup), prepend new
  const filtered = history.filter(
    (h) => !(h.owner === entry.owner && h.repoName === entry.repoName)
  );

  writeHistory([newEntry, ...filtered].slice(0, MAX_ENTRIES));
}

export function useScanHistory() {
  const [history, setHistory] = useState<ScanHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  const clearHistory = useCallback(() => {
    writeHistory([]);
    setHistory([]);
  }, []);

  const refresh = useCallback(() => {
    setHistory(readHistory());
  }, []);

  return { history, clearHistory, refresh };
}
