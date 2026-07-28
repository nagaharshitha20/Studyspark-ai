import { useEffect, useState } from "react";
import { Moon, Sun, GraduationCap } from "lucide-react";
import NotesInput from "./components/NotesInput.jsx";
import LoadingState from "./components/LoadingState.jsx";
import ErrorState from "./components/ErrorState.jsx";
import EmptyState from "./components/EmptyState.jsx";
import ResultTabs from "./components/ResultTabs.jsx";
import FlashcardView from "./components/FlashcardView.jsx";
import QuizView from "./components/QuizView.jsx";
import { useGenerateStudySet } from "./hooks/useGenerateStudySet.js";

export default function App() {
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("flashcards");
  const [isDark, setIsDark] = useState(() => window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false);

  const { status, data, error, generate, reset } = useGenerateStudySet();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  function handleSubmit() {
    if (!notes.trim()) return;
    setActiveTab("flashcards");
    generate(notes);
  }

  function handleRetry() {
    generate(notes);
  }

  const hasEmptyStudySet = data && data.flashcards.length === 0 && data.quiz.length === 0;

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-200 dark:border-ink-800">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-marker-500 text-white">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="font-display text-lg font-semibold">StudySpark AI</span>
          </div>
          <button
            onClick={() => setIsDark((d) => !d)}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="rounded-full p-2 hover:bg-ink-100 dark:hover:bg-ink-800 transition"
          >
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pb-24 pt-10">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink-900 dark:text-ink-100">
            Turn your notes into flashcards &amp; a quiz
          </h1>
          <p className="mt-2 text-ink-500 dark:text-ink-400">Paste anything. Get something you can actually study with.</p>
        </div>

        <NotesInput value={notes} onChange={setNotes} onSubmit={handleSubmit} isLoading={status === "loading"} />

        <div className="mt-10">
          {status === "idle" && <EmptyState />}
          {status === "loading" && <LoadingState />}
          {status === "error" && <ErrorState error={error} onRetry={handleRetry} />}

          {status === "success" && hasEmptyStudySet && (
            <div className="mx-auto mt-10 max-w-xl text-center text-ink-500 dark:text-ink-400">
              <p className="font-medium text-ink-800 dark:text-ink-200 mb-1">Not enough material to work with</p>
              <p className="text-sm">{data.summary}</p>
            </div>
          )}

          {status === "success" && !hasEmptyStudySet && (
            <div>
              <div className="mx-auto mb-8 max-w-2xl text-center">
                <h2 className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-100">{data.title}</h2>
                <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{data.summary}</p>
              </div>

              <ResultTabs
                active={activeTab}
                onChange={setActiveTab}
                flashcardCount={data.flashcards.length}
                quizCount={data.quiz.length}
              />

              {activeTab === "flashcards" ? (
                <FlashcardView key="flashcards" flashcards={data.flashcards} />
              ) : (
                <QuizView key="quiz" quiz={data.quiz} />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
