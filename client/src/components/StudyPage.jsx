import { useState } from "react";
import { ArrowLeft, History, BookOpen, HelpCircle } from "lucide-react";
import ResultTabs from "./ResultTabs.jsx";
import FlashcardView from "./FlashcardView.jsx";
import QuizView from "./QuizView.jsx";

/**
 * Full-page study view — shown after a successful generation or history load.
 * Manages its own tab state so FlashcardView / QuizView reset cleanly when
 * switching between history entries (keyed by `entryId`).
 */
export default function StudyPage({ data, isHistorical, entryId, onBack }) {
  const [activeTab, setActiveTab] = useState("flashcards");

  return (
    <div
      className="flex flex-col min-h-screen animate-studypage-in"
      style={{ animation: "studyFadeUp 0.35s cubic-bezier(0.4,0,0.2,1) both" }}
    >
      <style>{`
        @keyframes studyFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Study page top bar ────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-ink-950/90 backdrop-blur-md border-b border-ink-200 dark:border-ink-800">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-4 flex items-start gap-4">
          {/* Back button */}
          <button
            onClick={onBack}
            aria-label="Back to notes"
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border border-ink-200 dark:border-ink-800 px-3.5 py-2 text-sm font-medium text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition mt-0.5"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </button>

          {/* Title only */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl sm:text-2xl font-bold text-ink-900 dark:text-ink-100 leading-tight line-clamp-2">
              {data.title}
            </h1>
          </div>

          {/* Metadata + history badge */}
          <div className="flex-shrink-0 flex flex-col items-end gap-2 mt-0.5">
            {/* Card / quiz counts */}
            <div className="flex items-center gap-3 text-xs text-ink-400 dark:text-ink-500">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                {data.flashcards.length} cards
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
                {data.quiz.length} questions
              </span>
            </div>
            {isHistorical && (
              <span className="inline-flex items-center gap-1 rounded-full bg-highlight-400/20 px-2.5 py-0.5 text-[11px] font-medium text-highlight-600 dark:text-highlight-400">
                <History className="h-3 w-3" aria-hidden="true" />
                From history
              </span>
            )}
          </div>
        </div>

        {/* Tab switcher inside the bar */}
        <div className="mx-auto max-w-5xl px-4 sm:px-6 pb-3">
          <ResultTabs
            active={activeTab}
            onChange={setActiveTab}
            flashcardCount={data.flashcards.length}
            quizCount={data.quiz.length}
          />
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-10">
        {activeTab === "flashcards" ? (
          <FlashcardView
            key={`fc-${entryId || "live"}`}
            flashcards={data.flashcards}
          />
        ) : (
          <QuizView
            key={`qz-${entryId || "live"}`}
            quiz={data.quiz}
          />
        )}
      </main>
    </div>
  );
}
