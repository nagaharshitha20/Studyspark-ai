import { useEffect, useState, useCallback } from "react";
import { Moon, Sun, GraduationCap, History, PanelLeft } from "lucide-react";
import NotesInput from "./components/NotesInput.jsx";
import LoadingState from "./components/LoadingState.jsx";
import ErrorState from "./components/ErrorState.jsx";
import EmptyState from "./components/EmptyState.jsx";
import ResultTabs from "./components/ResultTabs.jsx";
import FlashcardView from "./components/FlashcardView.jsx";
import QuizView from "./components/QuizView.jsx";
import HistorySidebar from "./components/HistorySidebar.jsx";
import { useGenerateStudySet } from "./hooks/useGenerateStudySet.js";
import { useHistory } from "./hooks/useHistory.js";

const SIDEBAR_WIDTH = 280; // px — must match the sidebar's w-[280px]

export default function App() {
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("flashcards");
  const [isDark, setIsDark] = useState(
    () => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // open by default
  const [activeEntryId, setActiveEntryId] = useState(null);

  // Local override to display historical data without re-generating
  const [historyStatus, setHistoryStatus] = useState(null);
  const [historyData, setHistoryData] = useState(null);

  const { status, data, error, generate } = useGenerateStudySet();
  const { history, addEntry, removeEntry } = useHistory();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  // Auto-save to history whenever a fresh generation succeeds
  useEffect(() => {
    if (status === "success" && data && activeEntryId === null) {
      const id = addEntry(notes, data);
      setActiveEntryId(id);
    }
  }, [status, data]); // eslint-disable-line react-hooks/exhaustive-deps

  // Composite display values: history replay takes priority over live
  const displayStatus = historyStatus || status;
  const displayData = historyStatus ? historyData : data;
  const hasEmptyStudySet =
    displayData && displayData.flashcards.length === 0 && displayData.quiz.length === 0;

  // ── handlers ─────────────────────────────────────────────────────────────

  function handleNotesSubmit() {
    if (!notes.trim()) return;
    // Clear any history replay and start fresh
    setHistoryStatus(null);
    setHistoryData(null);
    setActiveEntryId(null);
    setActiveTab("flashcards");
    generate(notes);
  }

  function handleRetry() {
    generate(notes);
  }

  /** "New Study Set" button inside the sidebar — resets everything */
  function handleNewStudySet() {
    setNotes("");
    setHistoryStatus(null);
    setHistoryData(null);
    setActiveEntryId(null);
    setActiveTab("flashcards");
  }

  /** Click a history card — restore that session without calling the API */
  const handleSelectEntry = useCallback((entry) => {
    setNotes(entry.notes);
    setActiveTab("flashcards");
    setActiveEntryId(entry.id);
    setHistoryData(entry.data);
    setHistoryStatus("success");
  }, []);

  /** Remove one history entry; if it's the active one, clear the view */
  const handleRemoveEntry = useCallback(
    (id) => {
      removeEntry(id);
      if (id === activeEntryId) {
        setHistoryStatus(null);
        setHistoryData(null);
        setActiveEntryId(null);
        setNotes("");
      }
    },
    [activeEntryId, removeEntry]
  );

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen">
      {/* ── Fixed sidebar (part of flex layout) ─────────────────────── */}
      <HistorySidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((o) => !o)}
        history={history}
        onSelectEntry={handleSelectEntry}
        onRemoveEntry={handleRemoveEntry}
        onNewStudySet={handleNewStudySet}
        activeEntryId={activeEntryId}
      />

      {/* ── Main content area — shifts right when sidebar is open ─────── */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all duration-300 ease-in-out"
        style={{ marginLeft: isSidebarOpen ? SIDEBAR_WIDTH : 0 }}
      >
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-ink-200 dark:border-ink-800 bg-white/80 dark:bg-ink-950/80 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-4 max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3">
              {/* Sidebar toggle button (in header) */}
              <button
                onClick={() => setIsSidebarOpen((o) => !o)}
                aria-label={isSidebarOpen ? "Collapse sidebar" : "Open history sidebar"}
                title={isSidebarOpen ? "Collapse sidebar" : "History"}
                className="relative rounded-full p-2 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
              >
                <PanelLeft className="h-4 w-4" aria-hidden="true" />
                {!isSidebarOpen && history.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-marker-500 text-[9px] font-bold text-white leading-none">
                    {history.length > 9 ? "9+" : history.length}
                  </span>
                )}
              </button>

              {/* Logo — only show when sidebar is closed (sidebar has its own) */}
              {!isSidebarOpen && (
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-marker-500 text-white">
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="font-display text-lg font-semibold">StudySpark AI</span>
                </div>
              )}
            </div>

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

        {/* Page content */}
        <main className="flex-1 mx-auto w-full max-w-4xl px-4 pb-24 pt-10">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 dark:text-ink-100">
              Turn your notes into flashcards &amp; a quiz
            </h1>
            <p className="mt-2 text-ink-500 dark:text-ink-400">
              Paste anything. Get something you can actually study with.
            </p>
          </div>

          <NotesInput
            value={notes}
            onChange={setNotes}
            onSubmit={handleNotesSubmit}
            isLoading={status === "loading"}
          />

          <div className="mt-10">
            {displayStatus === "idle" && <EmptyState />}
            {status === "loading" && <LoadingState />}
            {status === "error" && !historyStatus && (
              <ErrorState error={error} onRetry={handleRetry} />
            )}

            {displayStatus === "success" && hasEmptyStudySet && (
              <div className="mx-auto mt-10 max-w-xl text-center text-ink-500 dark:text-ink-400">
                <p className="font-medium text-ink-800 dark:text-ink-200 mb-1">
                  Not enough material to work with
                </p>
                <p className="text-sm">{displayData.summary}</p>
              </div>
            )}

            {displayStatus === "success" && !hasEmptyStudySet && (
              <div>
                <div className="mx-auto mb-8 max-w-2xl text-center">
                  <h2 className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-100">
                    {displayData.title}
                  </h2>
                  <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">
                    {displayData.summary}
                  </p>
                  {historyStatus && (
                    <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-highlight-400/20 px-3 py-1 text-xs font-medium text-highlight-600 dark:text-highlight-400">
                      <History className="h-3 w-3" aria-hidden="true" />
                      Loaded from history
                    </span>
                  )}
                </div>

                <ResultTabs
                  active={activeTab}
                  onChange={setActiveTab}
                  flashcardCount={displayData.flashcards.length}
                  quizCount={displayData.quiz.length}
                />

                {activeTab === "flashcards" ? (
                  <FlashcardView
                    key={`flashcards-${activeEntryId || "live"}`}
                    flashcards={displayData.flashcards}
                  />
                ) : (
                  <QuizView
                    key={`quiz-${activeEntryId || "live"}`}
                    quiz={displayData.quiz}
                  />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
