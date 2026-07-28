import { useState, useCallback } from "react";

const STORAGE_KEY = "studyspark_history";
const MAX_ENTRIES = 50;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Manages a persistent history of generated study sets in localStorage.
 * Each entry contains: id, title, summary, createdAt, flashcardCount, quizCount, data, notes.
 */
export function useHistory() {
  const [history, setHistory] = useState(() => loadHistory());

  const addEntry = useCallback((notes, data) => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: data.title,
      summary: data.summary,
      createdAt: new Date().toISOString(),
      flashcardCount: data.flashcards.length,
      quizCount: data.quiz.length,
      notes,
      data,
    };

    setHistory((prev) => {
      const updated = [entry, ...prev].slice(0, MAX_ENTRIES);
      saveHistory(updated);
      return updated;
    });

    return entry.id;
  }, []);

  const removeEntry = useCallback((id) => {
    setHistory((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return { history, addEntry, removeEntry, clearHistory };
}
