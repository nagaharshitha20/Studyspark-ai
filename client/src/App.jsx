import { useEffect, useState, useCallback } from "react";
import { Moon, Sun, GraduationCap, PanelLeft, Sparkles } from "lucide-react";
import NotesInput from "./components/NotesInput.jsx";
import LoadingState from "./components/LoadingState.jsx";
import ErrorState from "./components/ErrorState.jsx";
import StudyPage from "./components/StudyPage.jsx";
import HistorySidebar from "./components/HistorySidebar.jsx";
import { useGenerateStudySet } from "./hooks/useGenerateStudySet.js";
import { useHistory } from "./hooks/useHistory.js";

const SIDEBAR_WIDTH = 280;

export default function App() {
  // ── Theme ─────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ── Page routing: "home" | "study" ───────────────────────────────────────
  const [view, setView] = useState("home");

  // ── Notes input state ─────────────────────────────────────────────────────
  const [notes, setNotes] = useState("");

  // ── Generation ────────────────────────────────────────────────────────────
  const { status, data, error, generate } = useGenerateStudySet();

  // ── History ───────────────────────────────────────────────────────────────
  const { history, addEntry, removeEntry } = useHistory();

  // ── Active displayed content (live OR history replay) ────────────────────
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [historyData, setHistoryData] = useState(null); // non-null = history mode
  // Effective display data
  const displayData = historyData ?? data;
  const isHistorical = historyData !== null;

  // ── Auto-save + switch to study on successful generation ─────────────────
  useEffect(() => {
    if (status === "success" && data && !historyData) {
      // Only add entry once per fresh generation
      if (activeEntryId === null) {
        const id = addEntry(notes, data);
        setActiveEntryId(id);
      }
      setView("study");
    }
  }, [status, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Submit from notes input → generate fresh study set */
  function handleNotesSubmit() {
    if (!notes.trim()) return;
    // Clear any history replay
    setHistoryData(null);
    setActiveEntryId(null);
    generate(notes);
    // Stay on home while loading; switch happens in useEffect above
  }

  function handleRetry() {
    generate(notes);
  }

  /** "New Study Set" button in sidebar */
  function handleNewStudySet() {
    setNotes("");
    setHistoryData(null);
    setActiveEntryId(null);
    setView("home");
  }

  /** Back button on StudyPage */
  function handleBackToHome() {
    setView("home");
  }

  /** Clicking a history card in the sidebar */
  const handleSelectEntry = useCallback((entry) => {
    setNotes(entry.notes);
    setActiveEntryId(entry.id);
    setHistoryData(entry.data);
    setView("study");
  }, []);

  /** Delete a history entry; if it's currently shown, go back home */
  const handleRemoveEntry = useCallback(
    (id) => {
      removeEntry(id);
      if (id === activeEntryId) {
        setHistoryData(null);
        setActiveEntryId(null);
        setView("home");
      }
    },
    [activeEntryId, removeEntry]
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar */}
      <HistorySidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((o) => !o)}
        history={history}
        onSelectEntry={handleSelectEntry}
        onRemoveEntry={handleRemoveEntry}
        onNewStudySet={handleNewStudySet}
        activeEntryId={activeEntryId}
      />

      {/* Main content — shifts right when sidebar is open */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out"
        style={{ marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0 }}
      >
        {/* ══ HOME VIEW ════════════════════════════════════════════════════ */}
        {view === "home" && (
          <>
            {/* Header */}
            <header className="sticky top-0 z-20 border-b border-ink-200 dark:border-ink-800 bg-white/80 dark:bg-ink-950/80 backdrop-blur-md">
              <div className="flex items-center justify-between px-4 py-4 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-3">
                  {/* Sidebar toggle */}
                  <button
                    onClick={() => setIsSidebarOpen((o) => !o)}
                    aria-label={isSidebarOpen ? "Collapse sidebar" : "Open history sidebar"}
                    title={isSidebarOpen ? "Collapse sidebar" : "Open history"}
                    className="relative rounded-full p-2 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
                  >
                    <PanelLeft className="h-4 w-4" aria-hidden="true" />
                    {!isSidebarOpen && history.length > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-marker-500 text-[9px] font-bold text-white leading-none">
                        {history.length > 9 ? "9+" : history.length}
                      </span>
                    )}
                  </button>

                  {/* Logo — only when sidebar is collapsed */}
                  {!isSidebarOpen && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-marker-500 text-white">
                        <GraduationCap className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <span className="font-display text-lg font-semibold">StudySpark AI</span>
                    </div>
                  )}
                </div>

                {/* Dark mode toggle */}
                <button
                  onClick={() => setIsDark((d) => !d)}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  className="rounded-full p-2 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
                >
                  {isDark ? (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Moon className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </header>

            {/* Home page content */}
            <main className="flex-1 mx-auto w-full max-w-4xl px-4 pb-24 pt-12">
              {/* Hero */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-marker-500 text-white mb-5 shadow-lg">
                  <Sparkles className="h-7 w-7" aria-hidden="true" />
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 dark:text-ink-100">
                  Turn your notes into flashcards &amp; a quiz
                </h1>
                <p className="mt-3 text-ink-500 dark:text-ink-400 text-base max-w-lg mx-auto leading-relaxed">
                  Paste any notes or describe a topic. StudySpark generates a full study set instantly.
                </p>
              </div>

              {/* Notes input */}
              <NotesInput
                value={notes}
                onChange={setNotes}
                onSubmit={handleNotesSubmit}
                isLoading={status === "loading"}
              />

              {/* Status feedback */}
              <div className="mt-10">
                {status === "loading" && <LoadingState />}
                {status === "error" && (
                  <ErrorState error={error} onRetry={handleRetry} />
                )}
                {status === "idle" && (
                  <div className="flex flex-col items-center gap-3 mt-8 text-ink-400 dark:text-ink-600 text-sm select-none">
                    <div className="grid grid-cols-3 gap-3 w-full max-w-md opacity-40">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-20 rounded-xl bg-ink-200 dark:bg-ink-800 animate-pulse"
                          style={{ animationDelay: `${i * 120}ms` }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-center text-ink-400 dark:text-ink-600">
                      Your flashcards &amp; quiz will appear on the next page →
                    </p>
                  </div>
                )}
              </div>
            </main>
          </>
        )}

        {/* ══ STUDY VIEW ══════════════════════════════════════════════════ */}
        {view === "study" && displayData && (
          <StudyPage
            key={activeEntryId || "live"}
            data={displayData}
            isHistorical={isHistorical}
            entryId={activeEntryId}
            onBack={handleBackToHome}
          />
        )}
      </div>
    </div>
  );
}
